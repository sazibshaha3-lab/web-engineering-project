<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampusEatsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_seeded_catalog_and_public_visibility(): void
    {
        $this->assertSame(8, Category::count());
        $this->assertSame(8, Restaurant::count());
        $this->assertSame(19, Food::count());
        $this->assertSame(14, Review::count());
        $this->assertSame(6, Rider::count());

        $restaurants = $this->getJson('/api/restaurants')->assertOk()->json();
        $this->assertCount(6, $restaurants);
        $this->assertCount(6, collect($restaurants)->filter(fn ($r) => $r['approval_status'] === 'APPROVED' && ! $r['blocked']));

        $foods = $this->getJson('/api/foods')->assertOk()->json();
        $this->assertNotEmpty($foods);
        foreach ($foods as $food) {
            $this->assertArrayHasKey('extras', $food);
            $this->assertContains($food['restaurant_id'], collect($restaurants)->pluck('id')->all());
        }
    }

    public function test_seeded_auth_and_role_authorization(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        foreach ([
            ['demo@campuseats.test', 'Demo123!', 'customer'],
            ['restaurant@campuseats.test', 'Restaurant123!', 'restaurant_owner'],
            ['rider@campuseats.test', 'Rider123!', 'rider'],
            ['admin@campuseats.test', 'Admin123!', 'admin'],
        ] as [$email, $password, $role]) {
            $login = $this->postJson('/api/login', compact('email', 'password'))->assertOk();
            $this->assertSame($role, $login->json('user.role'));
            if ($role === 'customer') {
                $this->withToken($login->json('token'))->getJson('/api/me')->assertOk()->assertJsonPath('role', $role);
            }
        }

        $this->postJson('/api/login', ['email' => 'demo@campuseats.test', 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/register', [
            'name' => 'Bad Admin', 'email' => 'bad-admin@example.test', 'phone' => '12345678',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!', 'role' => 'admin',
        ])->assertUnprocessable();
        $customer = User::where('email', 'demo@campuseats.test')->firstOrFail();
        $customerToken = $customer->createToken('test')->plainTextToken;
        $this->withToken($customerToken)->getJson('/api/admin/stats')->assertForbidden();
        $this->withToken($customerToken)->getJson('/api/owner/foods')->assertForbidden();
        $this->withToken($customerToken)->getJson('/api/rider/available-orders')->assertForbidden();
    }

    public function test_owner_food_patches_keep_or_replace_extras_and_enforce_ownership(): void
    {
        $ownerToken = $this->postJson('/api/login', ['email' => 'restaurant@campuseats.test', 'password' => 'Restaurant123!'])->assertOk()->json('token');
        $category = Category::firstOrFail();
        $created = $this->withToken($ownerToken)->postJson('/api/owner/foods', [
            'category_id' => (string) $category->id,
            'name' => 'Test food', 'price' => '250', 'preparation_time' => '12-15 min',
            'extras' => [['name' => 'Cheese', 'price' => '30']],
        ]);
        $created->assertCreated();
        $foodId = $created->json('id');
        $this->withToken($ownerToken)->putJson("/api/owner/foods/{$foodId}", ['is_available' => false])
            ->assertOk()->assertJsonCount(1, 'extras');
        $this->withToken($ownerToken)->putJson("/api/owner/foods/{$foodId}", ['extras' => [['name' => 'Sauce', 'price' => 12]]])
            ->assertOk()->assertJsonPath('extras.0.name', 'Sauce');

        $foreignFood = Food::where('restaurant_id', '!=', 1)->firstOrFail();
        $this->withToken($ownerToken)->putJson("/api/owner/foods/{$foreignFood->id}", ['is_available' => false])->assertForbidden();
        $this->withToken($ownerToken)->deleteJson("/api/owner/foods/{$foreignFood->id}")->assertForbidden();
        $this->withToken($ownerToken)->putJson('/api/owner/restaurant', ['is_open' => false])->assertOk()->assertJsonPath('is_open', false);
    }
}
