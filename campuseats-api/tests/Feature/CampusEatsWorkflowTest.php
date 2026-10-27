<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class CampusEatsWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function token(string $email, string $password): string
    {
        return $this->postJson('/api/login', compact('email', 'password'))
            ->assertOk()->json('token');
    }

    private function asToken(string $token): static
    {
        Auth::forgetGuards();
        return $this->withToken($token);
    }

    private function address(string $token): int
    {
        return $this->asToken($token)->postJson('/api/addresses', [
            'label' => 'Test', 'line' => '1 Test Road', 'city' => 'Dhaka',
        ])->assertCreated()->json('id');
    }

    private function placeOrder(string $token, int $restaurantId, int $foodId, int $addressId, array $extras = [], string $payment = 'cash', int $quantity = 1)
    {
        return $this->asToken($token)->postJson('/api/orders', [
            'restaurant_id' => $restaurantId,
            'address_id' => $addressId,
            'payment_method' => $payment,
            'items' => [['food_id' => $foodId, 'quantity' => $quantity, 'extras' => $extras]],
        ]);
    }

    private function approveRider(string $adminToken): Rider
    {
        $rider = User::where('email', 'rider@campuseats.test')->firstOrFail()->rider;
        if ($rider->approval_status !== 'APPROVED') {
            $this->asToken($adminToken)->patchJson("/api/admin/riders/{$rider->id}/approval", ['approval_status' => 'APPROVED'])->assertOk();
        }
        return $rider->fresh();
    }

    public function test_admin_blocks_customers_revokes_tokens_and_validates_status_targets(): void
    {
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $existingToken = $customer->createToken('before-block')->plainTextToken;

        foreach (['active', 'inactive'] as $status) {
            $this->asToken($adminToken)->patchJson("/api/admin/customers/{$customer->id}/status", compact('status'))
                ->assertOk()->assertJsonPath('status', $status);
        }
        $this->asToken($adminToken)->patchJson("/api/admin/customers/{$customer->id}/status", ['status' => 'blocked'])
            ->assertOk()->assertJsonPath('status', 'blocked');
        $this->asToken($existingToken)->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/login', ['email' => $customer->email, 'password' => 'Demo123!'])->assertUnprocessable();
        $this->asToken($adminToken)->patchJson("/api/admin/customers/{$customer->id}/status", ['status' => 'deleted'])->assertUnprocessable();
        $admin = User::where('email', 'admin@campuseats.test')->firstOrFail();
        $this->asToken($adminToken)->patchJson("/api/admin/customers/{$admin->id}/status", ['status' => 'blocked'])->assertNotFound();
    }

    public function test_admin_restaurant_and_rider_approval_transitions(): void
    {
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $pending = Restaurant::where('name', 'Green Leaf Kitchen')->firstOrFail();
        $this->assertSame(7, (int) $pending->id);
        $this->assertSame('PENDING', $pending->approval_status);
        $this->asToken($adminToken)->patchJson("/api/admin/restaurants/{$pending->id}/approval", ['approval_status' => 'APPROVED'])
            ->assertOk()->assertJsonPath('approval_status', 'APPROVED');
        $this->getJson('/api/restaurants')->assertOk()->assertJsonFragment(['name' => 'Green Leaf Kitchen']);
        $this->asToken($adminToken)->patchJson("/api/admin/restaurants/{$pending->id}/blocked", ['blocked' => true])
            ->assertOk()->assertJsonPath('blocked', true);
        $this->assertNotContains($pending->id, collect($this->getJson('/api/restaurants')->assertOk()->json())->pluck('id')->all());

        $rider = User::where('email', 'rider@campuseats.test')->firstOrFail()->rider;
        $this->asToken($adminToken)->patchJson("/api/admin/riders/{$rider->id}/approval", ['approval_status' => 'BLOCKED'])
            ->assertOk()->assertJsonPath('approval_status', 'BLOCKED');
        $this->asToken($adminToken)->patchJson("/api/admin/riders/{$rider->id}/approval", ['approval_status' => 'UNKNOWN'])->assertUnprocessable();
    }

    public function test_order_creation_prices_from_database_and_rejects_invalid_conditions(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $addressId = $this->address($customerToken);
        $restaurant = Restaurant::findOrFail(1);
        $food = Food::where('restaurant_id', $restaurant->id)->where('is_available', true)->firstOrFail();
        $extra = $food->extras()->firstOrFail();
        $quantity = 2;
        $expectedSubtotal = ((float) $food->price + (float) $extra->price) * $quantity;
        $expectedTotal = $expectedSubtotal + (float) $restaurant->delivery_fee;

        $cashOrder = $this->placeOrder($customerToken, $restaurant->id, $food->id, $addressId, [(string) $extra->id], 'cash', $quantity)
            ->assertCreated()->assertJsonPath('payment_status', 'PENDING');
        $this->assertEquals($expectedTotal, (float) $cashOrder->json('total'));
        $this->assertEquals($expectedSubtotal, (float) $cashOrder->json('subtotal'));
        $this->placeOrder($customerToken, $restaurant->id, $food->id, $addressId, [], 'online')->assertCreated()->assertJsonPath('payment_status', 'PAID');

        $restaurant->update(['is_open' => false]);
        $this->placeOrder($customerToken, $restaurant->id, $food->id, $addressId)->assertUnprocessable();
        $restaurant->update(['is_open' => true]);

        $food->update(['is_available' => false]);
        $this->placeOrder($customerToken, $restaurant->id, $food->id, $addressId)->assertUnprocessable();
        $food->update(['is_available' => true]);

        $restaurant->update(['minimum_order' => 100000]);
        $this->placeOrder($customerToken, $restaurant->id, $food->id, $addressId)->assertUnprocessable();
        $restaurant->update(['minimum_order' => 0]);

        $foreignFood = Food::where('restaurant_id', '!=', $restaurant->id)->where('is_available', true)->firstOrFail();
        $this->placeOrder($customerToken, $restaurant->id, $foreignFood->id, $addressId)->assertUnprocessable();
        $this->assertDatabaseHas('orders', ['customer_id' => $customer->id, 'status' => 'PLACED']);
    }

    public function test_order_response_snapshots_address_and_item_contract_fields(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $address = $this->asToken($customerToken)->postJson('/api/addresses', [
            'label' => 'Home', 'line' => '42 Campus Road', 'area' => 'North', 'city' => 'Dhaka', 'details' => 'Blue gate',
        ])->assertCreated()->json();
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $extra = $food->extras()->firstOrFail();
        $restaurant = Restaurant::findOrFail(1);
        $snapshot = [
            'label' => $address['label'], 'line' => $address['line'], 'area' => $address['area'],
            'city' => $address['city'], 'details' => $address['details'],
        ];

        $created = $this->asToken($customerToken)->postJson('/api/orders', [
            'restaurant_id' => 1, 'address_id' => $address['id'], 'payment_method' => 'cash',
            'items' => [[
                'food_id' => $food->id, 'quantity' => 1,
                'extras' => [(string) $extra->id], 'custom_instructions' => 'no onion',
            ]],
        ])->assertCreated();

        $orderId = $created->json('id');
        $created->assertJsonPath('delivery_address', $snapshot)
            ->assertJsonPath('restaurant.delivery_time', $restaurant->delivery_time)
            ->assertJsonPath('review', null)
            ->assertJsonPath('items.0.custom_instructions', 'no onion')
            ->assertJsonPath('items.0.image', $food->image);
        $this->assertIsArray($created->json('delivery_address'));
        $selectedExtras = $created->json('items.0.selected_extras');
        $this->assertIsArray($selectedExtras);
        $this->assertCount(1, $selectedExtras);
        $this->assertSame((int) $extra->id, (int) $selectedExtras[0]['id']);
        $this->assertSame($extra->name, $selectedExtras[0]['name']);
        $this->assertEquals((float) $extra->price, (float) $selectedExtras[0]['price']);

        $this->asToken($customerToken)->deleteJson("/api/addresses/{$address['id']}")->assertNoContent();
        $this->asToken($customerToken)->getJson("/api/orders/{$orderId}")->assertOk()
            ->assertJsonPath('address_id', null)
            ->assertJsonPath('delivery_address', $snapshot);

        $stringAddressOrder = $this->asToken($customerToken)->postJson('/api/orders', [
            'restaurant_id' => 1, 'delivery_address' => 'Dorm 3, Room 12', 'payment_method' => 'cash',
            'items' => [['food_id' => $food->id, 'quantity' => 1]],
        ])->assertCreated();
        $stringAddressOrder->assertJsonPath('delivery_address.label', 'Delivery')
            ->assertJsonPath('delivery_address.line', 'Dorm 3, Room 12');

        $this->asToken($customerToken)->postJson('/api/orders', [
            'restaurant_id' => 1, 'delivery_address' => 'Dorm 3, Room 12', 'payment_method' => 'cash',
            'items' => [['food_id' => $food->id, 'quantity' => 1, 'custom_instructions' => str_repeat('x', 501)]],
        ])->assertUnprocessable();
    }

    public function test_order_lifecycle_claim_scoping_and_delivery_updates(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $ownerToken = $this->token('restaurant@campuseats.test', 'Restaurant123!');
        $otherOwnerToken = $this->token('owner-r2@campuseats.test', 'Restaurant123!');
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $otherCustomer = User::where('email', 'farhana.akter@campus.edu')->firstOrFail();
        $otherCustomerToken = $otherCustomer->createToken('other-customer')->plainTextToken;
        $r1Food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $r2Food = Food::where('restaurant_id', 2)->where('is_available', true)->firstOrFail();
        $customerAddress = $this->address($customerToken);
        $otherAddress = $this->address($otherCustomerToken);

        $cancelOrder = $this->placeOrder($customerToken, 1, $r1Food->id, $customerAddress)->assertCreated();
        $this->asToken($customerToken)->postJson("/api/orders/{$cancelOrder->json('id')}/cancel")->assertOk()->assertJsonPath('status', 'CANCELLED');

        $order = $this->placeOrder($customerToken, 1, $r1Food->id, $customerAddress)->assertCreated();
        $orderId = $order->json('id');
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'PREPARING'])->assertUnprocessable();
        $this->asToken($otherOwnerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'ACCEPTED'])->assertForbidden();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'ACCEPTED'])->assertOk();
        $this->asToken($customerToken)->postJson("/api/orders/{$orderId}/cancel")->assertUnprocessable();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'PREPARING'])->assertOk();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'READY_FOR_PICKUP'])->assertOk();

        $secondCustomerOrder = $this->placeOrder($otherCustomerToken, 1, $r1Food->id, $otherAddress)->assertCreated();
        $otherRestaurantOrder = $this->placeOrder($otherCustomerToken, 2, $r2Food->id, $otherAddress)->assertCreated();
        $rider = $this->approveRider($adminToken);
        $riderUser = $rider->user;
        $riderToken = $this->token($riderUser->email, 'Rider123!');
        $this->asToken($riderToken)->getJson('/api/rider/available-orders')->assertOk()->assertJsonFragment(['id' => $orderId]);
        $this->asToken($riderToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'PICKED_UP'])->assertForbidden();

        $otherApprovedRider = Rider::where('id', '!=', $rider->id)->firstOrFail();
        $otherApprovedRider->update(['approval_status' => 'APPROVED']);
        $otherRiderToken = $otherApprovedRider->user->createToken('second-rider')->plainTextToken;
        $this->asToken($riderToken)->postJson("/api/rider/orders/{$orderId}/claim")->assertOk();
        $this->asToken($otherRiderToken)->postJson("/api/rider/orders/{$orderId}/claim")->assertStatus(409);

        foreach (['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'] as $status) {
            $response = $this->asToken($riderToken)->patchJson("/api/orders/{$orderId}/status", compact('status'))->assertOk();
        }
        $this->assertSame('PAID', $response->json('payment_status'));
        $this->assertSame((int) $rider->total_deliveries + 1, (int) $rider->fresh()->total_deliveries);

        $this->asToken($customerToken)->getJson('/api/orders')->assertOk()->assertJsonCount(2);
        $this->asToken($otherOwnerToken)->getJson('/api/orders')->assertOk()->assertJsonCount(1)->assertJsonFragment(['id' => $otherRestaurantOrder->json('id')]);
        $this->asToken($ownerToken)->getJson('/api/orders')->assertOk()->assertJsonCount(3);
        $this->asToken($riderToken)->getJson('/api/orders')->assertOk()->assertJsonCount(1)->assertJsonFragment(['id' => $orderId]);
        $this->asToken($adminToken)->getJson('/api/orders')->assertOk()->assertJsonCount(4);
        $this->assertNotSame($secondCustomerOrder->json('id'), $orderId);
    }

    public function test_only_delivered_orders_can_be_reviewed_once_by_the_customer_and_refresh_restaurant_rating(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $ownerToken = $this->token('restaurant@campuseats.test', 'Restaurant123!');
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $anotherCustomer = User::where('email', 'farhana.akter@campus.edu')->firstOrFail();
        $anotherCustomerToken = $anotherCustomer->createToken('another-customer')->plainTextToken;
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $address = $this->address($customerToken);
        $delivered = $this->placeOrder($customerToken, 1, $food->id, $address)->assertCreated();
        $pending = $this->placeOrder($customerToken, 1, $food->id, $address)->assertCreated();
        $orderId = $delivered->json('id');
        $delivered->assertJsonPath('review', null)
            ->assertJsonPath('restaurant.delivery_time', Restaurant::findOrFail(1)->delivery_time);

        $this->asToken($customerToken)->postJson("/api/orders/{$orderId}/review", ['rating' => 5, 'comment' => 'Great'])->assertUnprocessable();
        $this->asToken($anotherCustomerToken)->postJson("/api/orders/{$orderId}/review", ['rating' => 5])->assertForbidden();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'ACCEPTED'])->assertOk();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'PREPARING'])->assertOk();
        $this->asToken($ownerToken)->patchJson("/api/orders/{$orderId}/status", ['status' => 'READY_FOR_PICKUP'])->assertOk();
        $rider = $this->approveRider($adminToken);
        $riderToken = $this->token($rider->user->email, 'Rider123!');
        $this->asToken($riderToken)->postJson("/api/rider/orders/{$orderId}/claim")->assertOk();
        foreach (['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'] as $status) {
            $this->asToken($riderToken)->patchJson("/api/orders/{$orderId}/status", compact('status'))->assertOk();
        }

        $this->asToken($customerToken)->postJson("/api/orders/{$pending->json('id')}/review", ['rating' => 4])->assertUnprocessable();
        $this->asToken($anotherCustomerToken)->postJson("/api/orders/{$orderId}/review", ['rating' => 5])->assertForbidden();
        $this->asToken($customerToken)->postJson("/api/orders/{$orderId}/review", ['rating' => 5, 'comment' => 'Great'])->assertCreated();
        $this->asToken($customerToken)->postJson("/api/orders/{$orderId}/review", ['rating' => 5])->assertUnprocessable();
        $this->asToken($customerToken)->getJson("/api/orders/{$orderId}")->assertOk()
            ->assertJsonPath('review.rating', 5)
            ->assertJsonPath('review.comment', 'Great')
            ->assertJsonPath('restaurant.delivery_time', Restaurant::findOrFail(1)->delivery_time);

        $restaurant = Restaurant::findOrFail(1);
        $reviews = $restaurant->reviews()->get();
        $this->assertSame($reviews->count(), (int) $restaurant->fresh()->review_count);
        $this->assertEquals(round((float) $reviews->avg('rating'), 1), (float) $restaurant->fresh()->rating);
    }
}

