<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInviteCodeSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function payload(string $role = 'admin', array $extra = []): array
    {
        $payload = [
            'name' => 'New Account', 'email' => strtolower($role).'@example.test',
            'password' => 'password123', 'role' => $role,
        ];
        if ($role === 'restaurant_owner') $payload += ['restaurant_name' => 'Test Cafe', 'restaurant_address' => 'Dhaka'];
        if ($role === 'rider') $payload += ['vehicle_type' => 'bike', 'vehicle_number' => 'DHA-1234'];
        return array_merge($payload, $extra);
    }

    public function test_admin_registration_is_disabled_without_a_configured_invite_code(): void
    {
        config(['campuseats.admin_registration_code' => '']);
        foreach ([[], ['admin_invite_code' => null], ['admin_invite_code' => ''], ['admin_invite_code' => 'anything']] as $extra) {
            $payload = array_merge($this->payload(), $extra);
            $this->postJson('/api/register', $payload)
                ->assertUnprocessable()->assertJsonValidationErrors('admin_invite_code');
        }
        $this->assertDatabaseMissing('users', ['role' => 'admin']);
    }

    public function test_incorrect_admin_invite_codes_fail_without_disclosing_the_code(): void
    {
        config(['campuseats.admin_registration_code' => 'Only-For-Testing-Secret']);
        foreach (['wrong', 'only-for-testing-secret'] as $wrong) {
            $this->postJson('/api/register', $this->payload('admin', ['admin_invite_code' => $wrong]))
                ->assertUnprocessable()->assertJsonValidationErrors('admin_invite_code')
                ->assertDontSee('Only-For-Testing-Secret');
        }
        $this->assertDatabaseMissing('users', ['role' => 'admin']);
    }

    public function test_correct_invite_code_creates_admin_and_returns_no_invite_secret(): void
    {
        config(['campuseats.admin_registration_code' => 'Only-For-Testing-Secret']);
        $response = $this->postJson('/api/register', $this->payload('admin', [
            'admin_invite_code' => 'Only-For-Testing-Secret',
        ]))->assertCreated()->assertJsonPath('user.role', 'admin');

        $this->assertNotEmpty($response->json('token'));
        $this->assertStringNotContainsString('Only-For-Testing-Secret', $response->getContent());
        $this->assertDatabaseHas('users', ['email' => 'admin@example.test', 'role' => 'admin']);
    }

    public function test_invite_code_cannot_change_another_requested_role(): void
    {
        config(['campuseats.admin_registration_code' => 'Only-For-Testing-Secret']);
        foreach (['customer', 'restaurant_owner', 'rider'] as $role) {
            $this->postJson('/api/register', $this->payload($role, [
                'admin_invite_code' => 'Only-For-Testing-Secret',
            ]))->assertCreated()->assertJsonPath('user.role', $role);
        }
        $this->assertDatabaseCount('users', 3);
        $this->assertDatabaseCount('restaurants', 1);
        $this->assertDatabaseCount('riders', 1);
        $this->assertSame('PENDING', Restaurant::firstOrFail()->approval_status);
        $this->assertSame('PENDING', Rider::firstOrFail()->approval_status);
        $this->assertDatabaseMissing('users', ['role' => 'admin']);
    }

    public function test_admin_registration_is_rate_limited(): void
    {
        config(['campuseats.auth_rate_limit' => 2, 'campuseats.admin_registration_code' => 'secret']);
        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->postJson('/api/register', $this->payload('admin', ['admin_invite_code' => 'wrong']))
                ->assertUnprocessable();
        }
        $this->postJson('/api/register', $this->payload('admin', ['admin_invite_code' => 'wrong']))
            ->assertStatus(429);
        $this->assertDatabaseMissing('users', ['role' => 'admin']);
    }
}
