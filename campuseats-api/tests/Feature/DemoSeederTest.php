<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Food;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Rider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_seeding_keeps_the_documented_demo_passwords(): void
    {
        config(['campuseats.seed_demo_accounts' => true]);
        $this->seed();

        foreach ([
            ['demo@campuseats.test', 'Demo123!'],
            ['restaurant@campuseats.test', 'Restaurant123!'],
            ['rider@campuseats.test', 'Rider123!'],
        ] as [$email, $password]) {
            $this->postJson('/api/login', compact('email', 'password'))->assertOk();
        }
    }

    public function test_disabling_demo_accounts_randomizes_non_admin_passwords_but_preserves_seeded_data(): void
    {
        config(['campuseats.seed_demo_accounts' => false, 'campuseats.admin_password' => 'ChosenAdmin456!']);
        $this->seed();

        foreach ([
            ['demo@campuseats.test', 'Demo123!'],
            ['restaurant@campuseats.test', 'Restaurant123!'],
            ['rider@campuseats.test', 'Rider123!'],
        ] as [$email, $password]) {
            $this->postJson('/api/login', compact('email', 'password'))->assertUnprocessable();
        }
        $this->postJson('/api/login', ['email' => 'admin@campuseats.test', 'password' => 'ChosenAdmin456!'])->assertOk();

        $this->assertSame(8, Category::count());
        $this->assertSame(8, Restaurant::count());
        $this->assertSame(19, Food::count());
        $this->assertSame(14, Review::count());
        $this->assertSame(6, Rider::count());
    }
}
