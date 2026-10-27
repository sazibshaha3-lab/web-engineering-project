<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\Order;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class Phase45Test extends TestCase
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

    private function createOrder(string $customerToken): Order
    {
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $response = $this->asToken($customerToken)->postJson('/api/orders', [
            'restaurant_id' => 1,
            'delivery_address' => 'Dorm 4, Room 10',
            'payment_method' => 'cash',
            'items' => [['food_id' => $food->id, 'quantity' => 1]],
        ])->assertCreated();

        return Order::findOrFail($response->json('id'));
    }

    private function readyForPickup(Order $order, string $ownerToken): void
    {
        foreach (['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'] as $status) {
            $this->asToken($ownerToken)->patchJson("/api/orders/{$order->id}/status", compact('status'))->assertOk();
        }
    }

    public function test_addresses_are_scoped_and_default_address_is_first(): void
    {
        $this->getJson('/api/addresses')->assertUnauthorized();
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $this->asToken($customerToken)->getJson('/api/addresses')->assertOk()->assertJsonCount(2);
        $addresses = $this->asToken($customerToken)->getJson('/api/addresses')->assertOk()->json();
        $this->assertTrue($addresses[0]['is_default']);

        $other = User::create([
            'name' => 'Other Customer',
            'email' => 'other@campuseats.test',
            'password' => 'Demo123!',
            'role' => 'customer',
        ]);
        $otherToken = $other->createToken('other-customer')->plainTextToken;
        $this->asToken($otherToken)->getJson('/api/addresses')->assertOk()->assertExactJson([]);
    }

    public function test_available_orders_are_unassigned_ready_orders_with_relationships(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $ownerToken = $this->token('restaurant@campuseats.test', 'Restaurant123!');
        $riderToken = $this->token('rider@campuseats.test', 'Rider123!');
        $rider = User::where('email', 'rider@campuseats.test')->firstOrFail()->rider;
        $this->assertSame('APPROVED', $rider->approval_status);

        $available = $this->createOrder($customerToken);
        $this->readyForPickup($available, $ownerToken);
        $notReady = $this->createOrder($customerToken);
        $assigned = $this->createOrder($customerToken);
        $this->readyForPickup($assigned, $ownerToken);
        $this->asToken($riderToken)->postJson("/api/rider/orders/{$assigned->id}/claim")->assertOk();

        $response = $this->asToken($riderToken)->getJson('/api/rider/available-orders')->assertOk();
        $response->assertJsonCount(1)->assertJsonPath('0.id', $available->id)
            ->assertJsonPath('0.customer.id', $available->customer_id)
            ->assertJsonPath('0.customer.name', User::findOrFail($available->customer_id)->name)
            ->assertJsonPath('0.customer.phone', User::findOrFail($available->customer_id)->phone)
            ->assertJsonPath('0.restaurant.delivery_time', $available->restaurant->delivery_time);
        $this->assertNotSame($notReady->id, $response->json('0.id'));
        $this->assertIsArray($response->json('0.items'));
        $this->asToken($customerToken)->getJson('/api/rider/available-orders')->assertForbidden();
    }

    public function test_rider_profile_updates_user_and_rider_fields(): void
    {
        $riderToken = $this->token('rider@campuseats.test', 'Rider123!');
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');

        $this->asToken($riderToken)->putJson('/api/rider/profile', [
            'name' => 'Rahim Updated',
            'phone' => '+880 1700 000000',
            'vehicle_type' => 'Bicycle',
            'vehicle_number' => 'DHA-99-9999',
        ])->assertOk()
            ->assertJsonPath('user.name', 'Rahim Updated')
            ->assertJsonPath('user.phone', '+880 1700 000000')
            ->assertJsonPath('vehicle_type', 'Bicycle')
            ->assertJsonPath('vehicle_number', 'DHA-99-9999');

        $this->asToken($riderToken)->putJson('/api/rider/profile', ['name' => ''])->assertUnprocessable();
        $this->asToken($customerToken)->putJson('/api/rider/profile', ['name' => 'Should Not Update'])->assertForbidden();
    }

    public function test_admin_can_advance_orders_only_through_allowed_transitions_without_a_rider(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $order = $this->createOrder($customerToken);

        $this->asToken($adminToken)->patchJson("/api/orders/{$order->id}/status", ['status' => 'PREPARING'])->assertUnprocessable();
        foreach (['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'] as $status) {
            $this->asToken($adminToken)->patchJson("/api/orders/{$order->id}/status", compact('status'))->assertOk();
        }
        $this->assertSame('PAID', $order->fresh()->payment_status);

        $rejectable = $this->createOrder($customerToken);
        $this->asToken($adminToken)->patchJson("/api/orders/{$rejectable->id}/status", ['status' => 'REJECTED'])
            ->assertOk()->assertJsonPath('status', 'REJECTED');
    }

    public function test_admin_can_cancel_only_placed_orders(): void
    {
        $customerToken = $this->token('demo@campuseats.test', 'Demo123!');
        $ownerToken = $this->token('restaurant@campuseats.test', 'Restaurant123!');
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $placed = $this->createOrder($customerToken);
        $accepted = $this->createOrder($customerToken);
        $this->asToken($ownerToken)->patchJson("/api/orders/{$accepted->id}/status", ['status' => 'ACCEPTED'])->assertOk();

        $this->asToken($adminToken)->postJson("/api/admin/orders/{$placed->id}/cancel")->assertOk()
            ->assertJsonPath('status', 'CANCELLED');
        $this->asToken($adminToken)->postJson("/api/admin/orders/{$accepted->id}/cancel")->assertUnprocessable();
        $this->asToken($customerToken)->postJson("/api/admin/orders/{$accepted->id}/cancel")->assertForbidden();
    }

    public function test_admin_customer_and_rider_lists_include_panel_fields(): void
    {
        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $this->asToken($adminToken)->getJson('/api/admin/customers')->assertOk()
            ->assertJsonFragment(['orders_count' => 0, 'status' => 'active']);
        $this->asToken($adminToken)->getJson('/api/admin/riders')->assertOk()
            ->assertJsonFragment([
                'name' => User::where('email', 'rider@campuseats.test')->value('name'),
                'email' => 'rider@campuseats.test',
                'phone' => User::where('email', 'rider@campuseats.test')->value('phone'),
            ]);
    }
}
