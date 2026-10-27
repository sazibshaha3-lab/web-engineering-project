<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Address;
use App\Models\Food;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class PermissionMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_every_api_route_has_expected_role_access_and_auth_middleware(): void
    {
        $roles = ['guest', 'customer', 'restaurant_owner', 'rider', 'admin'];
        $users = [];
        foreach (array_slice($roles, 1) as $role) {
            $users[$role] = User::where('role', $role)->firstOrFail();
        }
        $customer = $users['customer'];
        $orders = [];
        foreach (array_slice($roles, 1) as $role) {
            $u = $users[$role];
            $orders[$role] = Order::create([
                'order_number' => 'ORD-MATRIX-' . $role, 'customer_id' => $customer->id,
                'restaurant_id' => $role === 'restaurant_owner' ? 1 : 2,
                'rider_id' => $role === 'rider' ? $u->rider->id : null,
                'delivery_address' => 'Test address', 'subtotal' => 10, 'delivery_fee' => 0,
                'discount' => 0, 'total' => 10,
            ]);
        }

        $public = [
            'POST api/register', 'POST api/login', 'POST api/login/google', 'GET api/categories', 'GET api/restaurants',
            'GET api/restaurants/{id}', 'GET api/restaurants/{id}/foods', 'GET api/restaurants/{id}/reviews',
            'GET api/foods', 'GET api/foods/{id}',
        ];
        $violations = [];
        $apiRoutes = collect(app('router')->getRoutes())->filter(fn (Route $route) => str_starts_with($route->uri(), 'api/'));

        foreach ($apiRoutes as $route) {
            $uri = $route->uri();
            $verbs = array_values(array_intersect($route->methods(), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));
            foreach ($verbs as $verb) {
                $signature = "$verb $uri";
                $isPublic = in_array($signature, $public, true);
                if (! $isPublic && ! in_array('auth:sanctum', $route->gatherMiddleware(), true)) {
                    $violations[] = "$signature middleware: missing auth:sanctum";
                }

                $allowed = $this->allowedRoles($verb, $uri, $isPublic);
                foreach ($roles as $role) {
                    $url = '/' . preg_replace_callback('/\{([^}]+)\}/', function ($m) use ($customer, $orders, $role) {
                        return match ($m[1]) {
                            'order' => (string) ($orders[$role]->id ?? $orders['customer']->id),
                            'address' => (string) Address::create(['user_id' => $customer->id, 'label' => 'Matrix', 'line' => 'Test address'])->id,
                            'food' => (string) Food::create(['restaurant_id' => 1, 'name' => 'Matrix food', 'price' => 1])->id,
                            'restaurant', 'category', 'rider', 'user', 'id' => '1', default => '1',
                        };
                    }, $uri);
                    Auth::forgetGuards();
                    if ($role !== 'guest') $this->actingAs($users[$role], 'sanctum');
                    $response = $this->call($verb, $url, [], [], [], ['HTTP_ACCEPT' => 'application/json']);
                    $status = $response->getStatusCode();
                    $shouldAllow = $isPublic || in_array($role, $allowed, true);
                    if ($shouldAllow && in_array($status, [401, 403], true)) {
                        $violations[] = "$signature caller=$role unexpectedly denied status=$status";
                    } elseif (! $shouldAllow && ! in_array($status, [401, 403], true)) {
                        $violations[] = "$signature caller=$role unexpectedly allowed status=$status";
                    }
                }
            }
        }

        $this->assertSame([], $violations, "Permission matrix violations:\n- " . implode("\n- ", $violations));
    }

    private function allowedRoles(string $verb, string $uri, bool $public): array
    {
        if ($public) return ['customer', 'restaurant_owner', 'rider', 'admin'];
        if (in_array($uri, ['api/me', 'api/logout'], true) || ($uri === 'api/me' && $verb === 'PUT') || ($uri === 'api/orders' && $verb === 'GET') || ($uri === 'api/orders/{order}' && $verb === 'GET')) {
            return ['customer', 'restaurant_owner', 'rider', 'admin'];
        }
        if ($uri === 'api/orders/{order}/status') return ['restaurant_owner', 'rider', 'admin'];
        if (str_starts_with($uri, 'api/owner/')) return ['restaurant_owner'];
        if (str_starts_with($uri, 'api/rider/')) return ['rider'];
        if (str_starts_with($uri, 'api/admin/')) return ['admin'];
        if (str_starts_with($uri, 'api/addresses') || in_array($uri, ['api/orders', 'api/orders/{order}/cancel', 'api/orders/{order}/review'], true)) {
            return ['customer'];
        }
        if ($uri === 'api/me' && $verb === 'PUT') return ['customer', 'restaurant_owner', 'rider', 'admin'];
        return [];
    }
}
