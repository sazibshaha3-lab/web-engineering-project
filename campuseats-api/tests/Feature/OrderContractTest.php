<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Notifications\OrderEventNotification;
use App\Notifications\RestaurantOrderInboxNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\SendQueuedNotifications;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderContractTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function token(): string
    {
        return $this->postJson('/api/login', [
            'email' => 'demo@campuseats.test',
            'password' => 'Demo123!',
        ])->assertOk()->json('token');
    }

    private function customer(string $token): static
    {
        Auth::forgetGuards();
        return $this->withToken($token);
    }

    private function makeOrder(string $token, array $overrides = [])
    {
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $payload = [
            'restaurant_id' => 1,
            'payment_method' => 'cash',
            'items' => [[
                'food_id' => $food->id,
                'quantity' => 1,
            ]],
        ];
        return $this->customer($token)->postJson('/api/orders', array_replace($payload, $overrides));
    }

    public function test_address_snapshot_and_item_response_contract_survive_address_deletion(): void
    {
        $token = $this->token();
        $user = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Dorm',
            'line' => 'Building 4, Room 12',
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'details' => 'Call on arrival',
        ]);
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $extra = FoodExtra::where('food_id', $food->id)->first();

        Queue::fake();
        $response = $this->makeOrder($token, [
            'address_id' => $address->id,
            'items' => [[
                'food_id' => $food->id,
                'quantity' => 1,
                'extras' => $extra ? [$extra->id] : [],
                'custom_instructions' => 'no onion',
            ]],
        ])->assertCreated()
            ->assertJsonPath('delivery_address', [
                'label' => 'Dorm',
                'line' => 'Building 4, Room 12',
                'area' => 'Dhanmondi',
                'city' => 'Dhaka',
                'details' => 'Call on arrival',
                'latitude' => null,
                'longitude' => null,
            ])
            ->assertJsonPath('items.0.custom_instructions', 'no onion')
            ->assertJsonPath('items.0.image', $food->image)
            ->assertJsonPath('restaurant.delivery_time', $food->restaurant->delivery_time)
            ->assertJsonPath('review', null);

        Queue::assertPushed(SendQueuedNotifications::class, fn ($job) =>
            $job->notification instanceof OrderEventNotification
            && $job->notification->event === 'restaurant_new_order'
        );

        $orderId = $response->json('id');
        $orderNumber = $response->json('order_number');
        $owner = User::findOrFail(Restaurant::findOrFail(1)->owner_id);
        $notification = $owner->notifications()
            ->where('type', RestaurantOrderInboxNotification::class)
            ->firstOrFail();
        $this->assertSame($orderNumber, $notification->data['order_number']);

        $this->actingAs($owner, 'sanctum')->getJson('/api/owner/notifications')
            ->assertOk()
            ->assertJsonPath('0.data.order_number', $orderNumber);
        $this->actingAs($owner, 'sanctum')->patchJson('/api/owner/notifications/'.$notification->id.'/read')
            ->assertOk()
            ->assertJsonPath('read', true);
        $this->assertNotNull($notification->fresh()->read_at);

        $this->customer($token)->getJson("/api/orders/by-number/{$orderNumber}")->assertOk()
            ->assertJsonPath('id', $orderId)
            ->assertJsonPath('status', 'PLACED');
        $this->assertIsArray($response->json('items.0.selected_extras'));
        if ($extra) {
            $this->assertSame((int) $extra->id, (int) $response->json('items.0.selected_extras.0.id'));
            $this->assertSame($extra->name, $response->json('items.0.selected_extras.0.name'));
        }

        $this->customer($token)->deleteJson("/api/addresses/{$address->id}")->assertNoContent();
        $this->customer($token)->getJson("/api/orders/{$orderId}")->assertOk()
            ->assertJsonPath('address_id', null)
            ->assertJsonPath('delivery_address.line', 'Building 4, Room 12')
            ->assertJsonPath('delivery_address.label', 'Dorm');
    }

    public function test_plain_delivery_address_and_instruction_validation_contract(): void
    {
        $token = $this->token();
        $this->makeOrder($token, ['delivery_address' => 'Dorm 3, Room 12'])
            ->assertCreated()
            ->assertJsonPath('delivery_address.label', 'Delivery')
            ->assertJsonPath('delivery_address.line', 'Dorm 3, Room 12');

        $this->makeOrder($token, [
            'delivery_address' => 'Dorm 3, Room 12',
            'items' => [[
                'food_id' => Food::where('restaurant_id', 1)->where('is_available', true)->value('id'),
                'quantity' => 1,
                'custom_instructions' => str_repeat('x', 501),
            ]],
        ])->assertUnprocessable();
    }

    public function test_order_inbox_notification_is_transactional_and_deduplicated_on_checkout_retry(): void
    {
        $token = $this->token();
        $food = Food::where('restaurant_id', 1)->where('is_available', true)->firstOrFail();
        $payload = [
            'restaurant_id' => 1,
            'payment_method' => 'cash',
            'delivery_address' => 'Dorm 3, Room 12',
            'idempotency_key' => (string) Str::uuid(),
            'items' => [['food_id' => $food->id, 'quantity' => 1]],
        ];

        Queue::fake();
        $first = $this->makeOrder($token, $payload)->assertCreated();
        $retry = $this->makeOrder($token, $payload)->assertOk()
            ->assertJsonPath('id', $first->json('id'));

        $owner = User::findOrFail(Restaurant::findOrFail(1)->owner_id);
        $notificationCount = $owner->notifications()
            ->where('type', RestaurantOrderInboxNotification::class)
            ->where('data->order_id', $first->json('id'))
            ->count();

        $this->assertSame(1, $notificationCount);
        $this->assertSame($first->json('order_number'), $retry->json('order_number'));
    }

    public function test_delivered_order_review_is_returned_in_order_contract(): void
    {
        $token = $this->token();
        $order = $this->makeOrder($token, ['delivery_address' => 'Dorm 3, Room 12'])->assertCreated();
        $model = Order::findOrFail($order->json('id'));
        $model->update(['status' => 'DELIVERED']);

        $this->customer($token)->postJson("/api/orders/{$model->id}/review", [
            'rating' => 5,
            'comment' => 'Great food',
        ])->assertCreated();

        $this->customer($token)->getJson("/api/orders/{$model->id}")->assertOk()
            ->assertJsonPath('review.rating', 5)
            ->assertJsonPath('review.comment', 'Great food');
    }
}
