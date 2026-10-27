<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ResponseSafetyTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void { parent::setUp(); $this->seed(); }
    private function token(string $email,string $password): string { return $this->postJson('/api/login',compact('email','password'))->assertOk()->json('token'); }

    public function test_api_responses_never_expose_password_or_remember_token(): void
    {
        $responses=[$this->getJson('/api/restaurants'),$this->getJson('/api/categories'),$this->postJson('/api/login',['email'=>'demo@campuseats.test','password'=>'Demo123!'])];
        foreach ($responses as $r) { $this->assertStringNotContainsString('password',strtolower($r->getContent())); $this->assertStringNotContainsString('remember_token',strtolower($r->getContent())); }
    }

    public function test_reviews_and_order_customer_fields_are_allowlisted(): void
    {
        $review=User::create(['name'=>'Reviewer','email'=>'review-safe@test.local','phone'=>'555','password'=>'Passw0rd!','role'=>'customer']);
        $order=Order::create(['order_number'=>'ORD-SAFE1','customer_id'=>$review->id,'restaurant_id'=>1,'delivery_address'=>'Home','subtotal'=>10,'delivery_fee'=>0,'discount'=>0,'total'=>10,'status'=>'DELIVERED']);
        $order->review()->create(['user_id'=>$review->id,'restaurant_id'=>1,'rating'=>5,'comment'=>'Good']);
        $reviews=$this->getJson('/api/restaurants/1/reviews')->assertOk()->json();
        foreach ($reviews as $row) { $this->assertEqualsCanonicalizing(['id','name','avatar'],array_keys($row['user'])); }
        $owner=$this->token('restaurant@campuseats.test','Restaurant123!');
        $row=$this->withToken($owner)->getJson('/api/orders')->assertOk()->json('0');
        $this->assertEqualsCanonicalizing(['id','name','phone'],array_keys($row['customer']));
    }

    public function test_debug_off_exception_is_generic_and_cors_allowlist_is_configurable(): void
    {
        config(['app.debug'=>false]);
        Route::get('/api/__test_exception',fn()=>throw new \RuntimeException('private exception detail'));
        $error=$this->getJson('/api/__test_exception')->assertStatus(500);
        $this->assertStringNotContainsString(base_path(),$error->getContent());
        $this->assertStringNotContainsString('private exception detail',$error->getContent());
        config(['cors.allowed_origins'=>['http://localhost:5173']]);
        $allowed=$this->call('OPTIONS','/api/restaurants',[],[],[],['HTTP_ORIGIN'=>'http://localhost:5173','HTTP_ACCESS_CONTROL_REQUEST_METHOD'=>'GET']);
        $this->assertSame('http://localhost:5173',$allowed->headers->get('Access-Control-Allow-Origin'));
        $denied=$this->call('OPTIONS','/api/restaurants',[],[],[],['HTTP_ORIGIN'=>'https://evil.example','HTTP_ACCESS_CONTROL_REQUEST_METHOD'=>'GET']);
        $this->assertNotSame('https://evil.example',$denied->headers->get('Access-Control-Allow-Origin'));
    }
}
