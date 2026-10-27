<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $d = json_decode(file_get_contents(database_path('seed-data.json')), true);
        $phone = '+880 1XXX-XXXXXX';
        $demoAccounts = (bool) config('campuseats.seed_demo_accounts', true);
        $password = static fn (string $demoPassword): string => $demoAccounts ? $demoPassword : Str::random(40);

        // ---- Admin + customers (same demo logins as the old mock AuthContext) ----
        // Production must set ADMIN_PASSWORD before seeding.
        User::create(['name' => 'Platform Admin', 'email' => 'admin@campuseats.test', 'phone' => $phone,
            'password' => config('campuseats.admin_password'), 'role' => 'admin']);

        $demo = User::create(['name' => 'Sazib Rahman', 'email' => 'demo@campuseats.test', 'phone' => $phone,
            'password' => $password('Demo123!'), 'role' => 'customer']);

        foreach ([
            ['Farhana Akter', 'farhana.akter@campus.edu', 'active'],
            ['Rakibul Islam', 'rakibul.islam@campus.edu', 'inactive'],
            ['Mehjabin Chowdhury', 'mehjabin.c@campus.edu', 'active'],
        ] as [$name, $email, $status]) {
            User::create(['name' => $name, 'email' => $email, 'phone' => $phone,
                'password' => $password('Demo123!'), 'role' => 'customer', 'status' => $status]);
        }

        foreach ($d['addresses'] as $a) {
            Address::create([
                'user_id' => $demo->id, 'label' => $a['label'], 'line' => $a['line'],
                'area' => $a['area'] ?? null, 'city' => $a['city'] ?? null,
                'details' => $a['details'] ?? null, 'is_default' => $a['isDefault'] ?? false,
            ]);
        }

        // ---- Categories ----
        $catIds = [];
        foreach ($d['categories'] as $c) {
            $catIds[$c['id']] = Category::create(['name' => $c['name'], 'image' => $c['image'] ?? null])->id;
        }

        // ---- Restaurants (+ one owner account each) ----
        $resIds = [];
        foreach ($d['restaurants'] as $r) {
            $email = $r['id'] === 'r1' ? 'restaurant@campuseats.test' : "owner-{$r['id']}@campuseats.test";
            $owner = User::create(['name' => $r['owner'], 'email' => $email, 'phone' => $phone,
                'password' => $password('Restaurant123!'), 'role' => 'restaurant_owner']);

            $resIds[$r['id']] = Restaurant::create([
                'owner_id' => $owner->id,
                'name' => $r['name'],
                'image' => $r['image'] ?? null,
                'logo' => $r['logo'] ?? null,
                'description' => $r['description'] ?? null,
                'address' => $r['address'],
                'category' => $r['category'] ?? null,
                'rating' => $r['rating'] ?? 0,
                'review_count' => $r['reviewCount'] ?? 0,
                'delivery_time' => $r['deliveryTime'] ?? null,
                'delivery_fee' => $r['deliveryFee'] ?? 0,
                'is_open' => $r['isOpen'] ?? true,
                'opening_time' => $r['openingTime'] ?? null,
                'closing_time' => $r['closingTime'] ?? null,
                'minimum_order' => $r['minimumOrder'] ?? 0,
                'approval_status' => $r['approvalStatus'] ?? 'PENDING',
                'blocked' => $r['blocked'] ?? false,
            ])->id;
        }

        // ---- Foods + extras ----
        foreach ($d['foods'] as $f) {
            $food = Food::create([
                'restaurant_id' => $resIds[$f['restaurantId']],
                'category_id' => $catIds[$f['category']] ?? null,
                'name' => $f['name'],
                'image' => $f['image'] ?? null,
                'description' => $f['description'] ?? null,
                'price' => $f['price'],
                'rating' => $f['rating'] ?? 0,
                'review_count' => $f['reviewCount'] ?? 0,
                'preparation_time' => $f['preparationTime'] ?? null,
                'is_available' => $f['isAvailable'] ?? true,
                'is_popular' => $f['isPopular'] ?? false,
            ]);

            foreach ($f['extras'] ?? [] as $e) {
                FoodExtra::create(['food_id' => $food->id, 'name' => $e['name'], 'price' => $e['price']]);
            }
        }

        // ---- Reviews (author name theke reviewer user toiri hoy) ----
        foreach ($d['reviews'] as $rv) {
            $reviewer = User::firstOrCreate(
                ['email' => Str::slug($rv['author']) . '@reviewer.campuseats.test'],
                ['name' => $rv['author'], 'password' => Str::random($demoAccounts ? 20 : 40), 'role' => 'customer']
            );

            $review = new Review([
                'restaurant_id' => $resIds[$rv['restaurantId']],
                'user_id' => $reviewer->id,
                'rating' => $rv['rating'],
                'comment' => $rv['comment'] ?? null,
            ]);
            $review->created_at = now()->subDays($rv['daysAgo'] ?? 0);
            $review->save();
        }

        // ---- Riders ----
        foreach ($d['riders'] as $r) {
            $user = User::create(['name' => $r['name'], 'email' => $r['email'], 'phone' => $r['phone'] ?? $phone,
                'password' => $password('Rider123!'), 'role' => 'rider']);

            Rider::create([
                'user_id' => $user->id,
                'vehicle_type' => $r['vehicleType'] ?? null,
                'vehicle_number' => $r['vehicleNumber'] ?? null,
                'rating' => $r['rating'] ?? 0,
                'total_deliveries' => $r['totalDeliveries'] ?? 0,
                'approval_status' => $r['approvalStatus'] ?? 'PENDING',
            ]);
        }
    }
}
