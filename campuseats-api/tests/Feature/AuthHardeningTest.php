<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_rate_limit_rejects_the_eleventh_attempt(): void
    {
        config(['campuseats.auth_rate_limit' => 10]);

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $this->postJson('/api/login', ['email' => 'unknown@example.test', 'password' => 'wrong'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/login', ['email' => 'unknown@example.test', 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_login_rate_limit_also_caps_attempts_per_ip(): void
    {
        config(['campuseats.auth_rate_limit' => 1]);

        foreach (['one', 'two', 'three'] as $suffix) {
            $this->postJson('/api/login', ['email' => "$suffix@example.test", 'password' => 'wrong'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/login', ['email' => 'four@example.test', 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_expired_personal_access_token_is_rejected(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $issued = $user->createToken('expired-test');
        $issued->accessToken->forceFill(['created_at' => now()->subDays(8)])->save();

        $this->withToken($issued->plainTextToken)->getJson('/api/me')->assertUnauthorized();
    }
}
