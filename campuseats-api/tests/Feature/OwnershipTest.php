<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Food;
use App\Models\Order;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class OwnershipTest extends TestCase
{
    use RefreshDatabase;

    private int $serial = 0;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function token(string $email, string $password): string
    {
        Auth::forgetGuards();
        return $this->postJson('/api/login', compact('email', 'password'))->assertOk()->json('token');
    }

    private function as(string $token): static
    {
        Auth::forgetGuards();
        return $this->withToken($token);
    }

    private function order(User $customer, int $restaurantId, string $status = 'PLACED', ?int $riderId = null): Order
    {
        return Order::create([
            'order_number' => 'ORD-OWN' . str_pad((string) ++$this->serial, 4, '0', STR_PAD_LEFT),
            'customer_id' => $customer->id, 'restaurant_id' => $restaurantId,
            'rider_id' => $riderId, 'delivery_address' => 'Test hostel',
            'subtotal' => 100, 'delivery_fee' => 10, 'discount' => 0, 'total' => 110,
            'status' => $status,
        ]);
    }

    public function test_customer_cannot_access_another_users_orders_or_addresses(): void
    {
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $other = User::create([
            'name' => 'Other customer', 'email' => 'other-owner@test.local',
            'password' => 'Passw0rd!', 'role' => 'customer',
        ]);
        $address = Address::create(['user_id' => $other->id, 'label' => 'Other', 'line' => 'Other road']);
        $delivered = $this->order($other, 1, 'DELIVERED');
        $placed = $this->order($other, 1);
        $token = $this->token('demo@campuseats.test', 'Demo123!');

        $this->as($token)->getJson("/api/orders/{$placed->id}")->assertForbidden();
        $this->as($token)->getJson("/api/orders/{$delivered->id}")->assertForbidden();
        $this->as($token)->postJson("/api/orders/{$placed->id}/cancel")->assertForbidden();
        $this->as($token)->postJson("/api/orders/{$delivered->id}/review", ['rating' => 5, 'comment' => 'No access'])->assertForbidden();
        $this->as($token)->putJson("/api/addresses/{$address->id}", ['label' => 'Changed'])->assertForbidden();
        $this->as($token)->deleteJson("/api/addresses/{$address->id}")->assertForbidden();
        $this->assertDatabaseHas('addresses', ['id' => $address->id, 'label' => 'Other']);
    }

    public function test_restaurant_owner_cannot_change_another_restaurants_food_or_order(): void
    {
        $ownerToken = $this->token('owner-r2@campuseats.test', 'Restaurant123!');
        $food = Food::where('restaurant_id', 1)->firstOrFail();
        $order = $this->order(User::where('email', 'demo@campuseats.test')->firstOrFail(), 1);

        $this->as($ownerToken)->putJson("/api/owner/foods/{$food->id}", ['name' => 'Hijacked'])->assertForbidden();
        $this->as($ownerToken)->putJson("/api/owner/foods/{$food->id}", ['is_available' => false])->assertForbidden();
        $this->as($ownerToken)->deleteJson("/api/owner/foods/{$food->id}")->assertForbidden();
        $this->as($ownerToken)->patchJson("/api/orders/{$order->id}/status", ['status' => 'ACCEPTED'])->assertForbidden();
        $this->assertSame('PLACED', $order->fresh()->status);

        $ownOrder = $this->order(User::where('email', 'demo@campuseats.test')->firstOrFail(), 2);
        $orders = $this->as($ownerToken)->getJson('/api/orders')->assertOk()->json();
        $this->assertContains($ownOrder->id, array_column($orders, 'id'));
        $this->assertNotContains($order->id, array_column($orders, 'id'));
    }

    public function test_rider_orders_are_claim_scoped_available_list_is_unassigned_and_admin_sees_all(): void
    {
        $riderToken = $this->token('rider@campuseats.test', 'Rider123!');
        $rider = User::where('email', 'rider@campuseats.test')->firstOrFail()->rider;
        $otherUser = User::create(['name' => 'Other rider', 'email' => 'rider-two@test.local', 'password' => 'Passw0rd!', 'role' => 'rider']);
        $otherRider = Rider::create(['user_id' => $otherUser->id, 'approval_status' => 'APPROVED']);
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $available = $this->order($customer, 1, 'READY_FOR_PICKUP');
        $claimedByOther = $this->order($customer, 2, 'READY_FOR_PICKUP', $otherRider->id);

        $availableRows = $this->as($riderToken)->getJson('/api/rider/available-orders')->assertOk()->json();
        $this->assertSame([$available->id], array_column($availableRows, 'id'));
        $this->as($riderToken)->postJson("/api/rider/orders/{$available->id}/claim")->assertOk();
        $this->as($riderToken)->getJson('/api/orders')->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $available->id);
        $this->as($riderToken)->patchJson("/api/orders/{$claimedByOther->id}/status", ['status' => 'PICKED_UP'])->assertForbidden();
        $this->as($riderToken)->patchJson("/api/orders/{$available->id}/status", ['status' => 'PICKED_UP'])->assertOk();

        $adminToken = $this->token('admin@campuseats.test', 'Admin123!');
        $adminRows = $this->as($adminToken)->getJson('/api/orders')->assertOk()->json();
        $this->assertContains($available->id, array_column($adminRows, 'id'));
        $this->assertContains($claimedByOther->id, array_column($adminRows, 'id'));
    }
}
