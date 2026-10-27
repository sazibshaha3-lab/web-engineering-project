<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_update_profile_and_response_matches_me(): void
    {
        $this->seed();
        $user = User::where('email', 'demo@campuseats.test')->firstOrFail();

        $updated = $this->actingAs($user, 'sanctum')->putJson('/api/me', [
            'name' => 'New Customer Name', 'phone' => '+880123456789',
        ])->assertOk()->json();
        $me = $this->getJson('/api/me')->assertOk()->json();

        $this->assertSame($me, $updated);
        $this->assertSame('New Customer Name', $updated['name']);
        $this->assertSame('+880123456789', $updated['phone']);
    }

    public function test_profile_update_ignores_protected_fields_and_requires_a_name(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'email' => 'before@example.test']);

        $this->actingAs($user, 'sanctum')->putJson('/api/me', [
            'name' => 'Safe Name', 'phone' => null, 'role' => 'admin',
            'email' => 'after@example.test', 'status' => 'blocked',
        ])->assertOk()->assertJsonPath('role', 'customer')->assertJsonPath('email', 'before@example.test')
            ->assertJsonPath('status', 'active');

        $this->assertSame('Safe Name', $user->fresh()->name);
        $this->assertNull($user->fresh()->phone);
        $this->putJson('/api/me', ['name' => ''])->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_guests_cannot_update_profile(): void
    {
        $this->putJson('/api/me', ['name' => 'Guest'])->assertUnauthorized();
    }

    public function test_rider_and_restaurant_owner_profile_responses_keep_relations_loaded(): void
    {
        $this->seed();
        foreach ([
            ['rider@campuseats.test', 'rider'],
            ['restaurant@campuseats.test', 'restaurant'],
        ] as [$email, $relation]) {
            $user = User::where('email', $email)->firstOrFail();
            $this->actingAs($user, 'sanctum')->putJson('/api/me', ['name' => 'Updated ' . ucfirst($relation)])
                ->assertOk()->assertJsonPath('name', 'Updated ' . ucfirst($relation))
                ->assertJsonStructure([$relation]);
        }
    }
}
