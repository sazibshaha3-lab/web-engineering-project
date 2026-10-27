<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class E2ePreconditionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_seeded_demo_accounts_and_restaurant_meet_e2e_preconditions(): void
    {
        $restaurant = Restaurant::with(['owner', 'foods'])->findOrFail(1);
        $this->assertSame('Campus Grill House', $restaurant->name);
        $this->assertSame('APPROVED', $restaurant->approval_status);
        $this->assertFalse($restaurant->blocked);
        $this->assertTrue($restaurant->is_open);
        $this->assertLessThanOrEqual(200, (float) $restaurant->minimum_order);
        $this->assertSame('restaurant@campuseats.test', $restaurant->owner->email);
        $this->assertTrue($restaurant->foods->contains(fn ($food) =>
            $food->is_available && (float) $food->price * 2 >= (float) $restaurant->minimum_order
        ));

        $customer = User::with('addresses')->where('email', 'demo@campuseats.test')->firstOrFail();
        $this->assertSame('customer', $customer->role);
        $this->assertSame('Sazib Rahman', $customer->name);
        $this->assertTrue($customer->addresses->contains('is_default', true));

        $rider = User::where('email', 'rider@campuseats.test')->firstOrFail();
        $this->assertSame('rider', $rider->role);
        $this->assertSame('APPROVED', Rider::where('user_id', $rider->id)->value('approval_status'));
        $this->assertSame('admin', User::where('email', 'admin@campuseats.test')->value('role'));
    }

    public function test_public_restaurant_endpoints_support_e2e_preconditions(): void
    {
        $restaurants = $this->getJson('/api/restaurants')->assertOk()->json();
        $this->assertGreaterThanOrEqual(6, count($restaurants));
        $this->getJson('/api/restaurants/1/reviews')->assertOk();
    }

    public function test_blocked_customer_cannot_use_existing_token_or_log_in(): void
    {
        $email = 'blocked-e2e@campuseats.test';
        $registration = $this->postJson('/api/register', [
            'name' => 'Block Me',
            'email' => $email,
            'password' => 'Passw0rd!',
            'role' => 'customer',
        ])->assertCreated()->assertJsonStructure(['user' => ['id'], 'token']);
        $customerToken = $registration->json('token');

        $adminToken = $this->postJson('/api/login', [
            'email' => 'admin@campuseats.test',
            'password' => 'Admin123!',
        ])->assertOk()->json('token');

        $this->withToken($adminToken)->patchJson('/api/admin/customers/'.$registration->json('user.id').'/status', [
            'status' => 'blocked',
        ])->assertOk();

        Auth::forgetGuards();
        $this->withToken($customerToken)->getJson('/api/me')->assertUnauthorized();
        Auth::forgetGuards();
        $login = $this->postJson('/api/login', ['email' => $email, 'password' => 'Passw0rd!'])
            ->assertUnprocessable();
        $this->assertStringContainsStringIgnoringCase('blocked', json_encode($login->json('message')));
    }
}
