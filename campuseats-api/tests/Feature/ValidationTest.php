<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void { parent::setUp(); $this->seed(); }

    private function token(string $email, string $password): string
    { return $this->postJson('/api/login', compact('email', 'password'))->assertOk()->json('token'); }

    public function test_write_endpoints_reject_missing_and_invalid_required_fields_as_json(): void
    {
        $owner = $this->token('restaurant@campuseats.test', 'Restaurant123!');
        $admin = $this->token('admin@campuseats.test', 'Admin123!');
        $rider = $this->token('rider@campuseats.test', 'Rider123!');
        $customer = $this->token('demo@campuseats.test', 'Demo123!');
        $food = Food::where('restaurant_id', 1)->firstOrFail();
        $order = Order::create(['order_number'=>'ORD-VAL1','customer_id'=>User::where('email','demo@campuseats.test')->value('id'),'restaurant_id'=>1,'delivery_address'=>'Home','subtotal'=>10,'delivery_fee'=>0,'discount'=>0,'total'=>10,'status'=>'DELIVERED']);
        $address = ['/api/addresses', ['label'=>'Home','line'=>'Somewhere']];
        $cases = [
            ['POST','/api/register',[],null], ['POST','/api/login',[],null],
            ['POST','/api/addresses',[], $customer], ['PUT','/api/addresses/1',['label'=>[]], $customer],
            ['POST','/api/orders',[], $customer], ['POST',"/api/orders/{$order->id}/review",[], $customer],
            ['PUT','/api/owner/restaurant',['name'=>[]], $owner], ['POST','/api/owner/foods',[], $owner],
            ['PUT',"/api/owner/foods/{$food->id}",['price'=>-1],$owner],
            ['POST','/api/admin/categories',[], $admin], ['PATCH','/api/admin/restaurants/1/approval',[], $admin],
            ['PUT','/api/rider/profile',['name'=>[]], $rider],
        ];
        foreach ($cases as [$method,$url,$data,$token]) {
            Auth::forgetGuards();
            $headers=['Accept'=>'application/json']; if ($token) $headers['Authorization']='Bearer '.$token;
            $response = $this->json($method,$url,$data,$headers);
            $this->assertNotSame(500,$response->status(),"$method $url must not 500");
            $this->assertSame('application/json',$response->headers->get('Content-Type'),"$method $url must return JSON");
            $this->assertSame(422,$response->status(),"$method $url should validate; response: {$response->getContent()}");
        }
        $this->postJson('/api/register',['name'=>'New','email'=>'demo@campuseats.test','password'=>'password1','role'=>'customer'])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/register',['name'=>'New','email'=>'new@example.test','password'=>'password1','role'=>'admin'])->assertUnprocessable()->assertJsonValidationErrors('admin_invite_code');
        $this->postJson('/api/register',['name'=>str_repeat('x',256),'email'=>'bad','password'=>2,'role'=>'customer'])->assertUnprocessable();
        $withoutAccept=$this->call('POST','/api/register',[],[],[],['CONTENT_TYPE'=>'application/json'],json_encode([]));
        $this->assertSame(422,$withoutAccept->status());
        $this->assertStringContainsString('application/json',$withoutAccept->headers->get('Content-Type'));
    }

    public function test_order_quantities_foreign_food_and_foreign_extras_are_safe(): void
    {
        $token=$this->token('demo@campuseats.test','Demo123!');
        $food=Food::where('restaurant_id',1)->firstOrFail();
        $foreign=Food::where('restaurant_id',2)->firstOrFail();
        $extraId=$foreign->extras()->value('id');
        $base=['restaurant_id'=>1,'delivery_address'=>'Home','payment_method'=>'cash'];
        foreach ([0,51] as $quantity) $this->withToken($token)->postJson('/api/orders',$base+['items'=>[['food_id'=>$food->id,'quantity'=>$quantity]]])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/orders',$base+['items'=>[['food_id'=>$foreign->id,'quantity'=>1]]])->assertUnprocessable();
        $response=$this->withToken($token)->postJson('/api/orders',$base+['items'=>[['food_id'=>$food->id,'quantity'=>1,'extras'=>array_filter([$extraId])]]])->assertCreated();
        $this->assertEmpty($response->json('items.0.selected_extras'));
    }

    public function test_html_and_sql_like_text_round_trip_in_valid_fields(): void
    {
        $token=$this->token('demo@campuseats.test','Demo123!');
        $name='<b>select * from users</b>';
        $this->withToken($token)->putJson('/api/me',['name'=>$name])->assertOk()->assertJsonPath('name',$name);
    }
}
