<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleTokenVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class GoogleLoginSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google.client_id' => 'web-client-test-id']);
    }

    private function verifier(array|false|\Throwable $result): void
    {
        $verifier = Mockery::mock(GoogleTokenVerifier::class);
        $verifier->shouldReceive('verify')->once()
            ->with('signed-test-token', ['audience' => 'web-client-test-id', 'throwException' => true])
            ->andReturnUsing(function () use ($result) {
                if ($result instanceof \Throwable) throw $result;
                return $result;
            });
        $this->instance(GoogleTokenVerifier::class, $verifier);
    }

    private function claims(array $changes = []): array
    {
        return array_merge([
            'iss' => 'https://accounts.google.com',
            'sub' => 'google-subject-123',
            'email' => 'customer@gmail.com',
            'email_verified' => true,
            'name' => 'Google Customer',
            'picture' => 'https://example.test/avatar.png',
        ], $changes);
    }

    public function test_missing_google_credential_is_rejected(): void
    {
        $this->postJson('/api/login/google', [])->assertUnprocessable()->assertJsonValidationErrors('credential');
        $this->assertDatabaseCount('users', 0);
    }

    public function test_verified_google_account_creates_customer_even_if_client_requests_admin(): void
    {
        $this->verifier($this->claims());

        $response = $this->postJson('/api/login/google', [
            'credential' => 'signed-test-token', 'role' => 'admin', 'password' => 'attacker-password',
        ])->assertOk()->assertJsonPath('user.role', 'customer');

        $user = User::where('email', 'customer@gmail.com')->firstOrFail();
        $this->assertSame('active', $user->status);
        $this->assertSame('google-subject-123', $user->google_id);
        $this->assertFalse(Hash::check('attacker-password', $user->password));
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_invalid_audience_or_expired_google_token_is_rejected_by_verifier(): void
    {
        foreach ([false, new RuntimeException('expired token details must stay private')] as $failure) {
            $this->verifier($failure);
            $response = $this->postJson('/api/login/google', ['credential' => 'signed-test-token']);
            $this->assertContains($response->status(), [422, 503]);
            $this->assertDatabaseCount('users', 0);
        }
    }

    public function test_unverified_email_or_invalid_issuer_is_rejected(): void
    {
        foreach ([['email_verified' => false], ['iss' => 'https://attacker.test']] as $invalidClaims) {
            $this->verifier($this->claims($invalidClaims));
            $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])
                ->assertUnprocessable()->assertJsonValidationErrors('credential');
            $this->assertDatabaseCount('users', 0);
        }
    }

    public function test_verifier_failure_returns_generic_error_and_creates_no_account(): void
    {
        $this->verifier(new RuntimeException('private provider response body'));
        $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])
            ->assertStatus(503)->assertDontSee('private provider response body');
        $this->assertDatabaseCount('users', 0);
    }

    public function test_existing_customer_can_link_and_sign_in_with_google(): void
    {
        $user = User::factory()->create(['email' => 'customer@gmail.com', 'role' => 'customer']);
        $this->verifier($this->claims());
        $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])
            ->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertSame('google-subject-123', $user->fresh()->google_id);
    }

    public function test_google_cannot_sign_in_or_link_privileged_existing_roles(): void
    {
        foreach (['admin', 'restaurant_owner', 'rider'] as $role) {
            $user = User::factory()->create([
                'email' => 'customer@gmail.com', 'google_id' => 'google-subject-123', 'role' => $role,
            ]);
            $this->verifier($this->claims());
            $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])
                ->assertUnprocessable()->assertJsonValidationErrors('credential')
                ->assertDontSee($role);
            $this->assertSame(0, $user->tokens()->count());
            $this->assertSame($role, $user->fresh()->role);
            $user->delete();
        }
    }

    public function test_blocked_customer_cannot_login_and_old_session_token_is_revoked(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@gmail.com', 'google_id' => 'google-subject-123', 'role' => 'customer', 'status' => 'blocked',
        ]);
        $oldToken = $user->createToken('old-session');
        $this->withToken($oldToken->plainTextToken)->getJson('/api/me')->assertUnauthorized();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $oldToken->accessToken->id]);

        $this->verifier($this->claims());
        $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])
            ->assertUnprocessable()->assertJsonValidationErrors('credential');
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_google_login_is_rate_limited(): void
    {
        config(['campuseats.auth_rate_limit' => 1]);
        $this->verifier(false);
        $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])->assertUnprocessable();
        $this->postJson('/api/login/google', ['credential' => 'signed-test-token'])->assertStatus(429);
    }
}
