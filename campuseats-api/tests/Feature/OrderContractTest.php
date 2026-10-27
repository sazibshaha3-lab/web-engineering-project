<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
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
            ])
            ->assertJsonPath('items.0.custom_instructions', 'no onion')
            ->assertJsonPath('items.0.image', $food->image)
            ->assertJsonPath('restaurant.delivery_time', $food->restaurant->delivery_time)
            ->assertJsonPath('review', null);

        $orderId = $response->json('id');
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
