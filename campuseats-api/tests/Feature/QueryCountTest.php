<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Rider;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class QueryCountTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void { parent::setUp(); $this->seed(); }
    private function token(string $email,string $password): string { return $this->postJson('/api/login',compact('email','password'))->assertOk()->json('token'); }

    private function countQueries(callable $request): int
    {
        $count=0;
        DB::listen(function(QueryExecuted $query) use (&$count) { if (preg_match('/^\s*(select|with)\b/i',$query->sql)) $count++; });
        $request();
        return $count;
    }

    public function test_catalog_order_admin_and_rider_lists_have_constant_query_counts(): void
    {
        $admin=$this->token('admin@campuseats.test','Admin123!');
        $riderToken=$this->token('rider@campuseats.test','Rider123!');
        $customer=User::where('role','customer')->firstOrFail();
        $food=Food::where('restaurant_id',1)->firstOrFail();
        foreach (['PLACED','READY_FOR_PICKUP'] as $i=>$status) {
            $order=Order::create(['order_number'=>"ORD-QBASE$i",'customer_id'=>$customer->id,'restaurant_id'=>1,'delivery_address'=>'Home','subtotal'=>10,'delivery_fee'=>0,'discount'=>0,'total'=>10,'status'=>$status]);
            OrderItem::create(['order_id'=>$order->id,'food_id'=>$food->id,'name'=>$food->name,'price'=>$food->price,'quantity'=>1]);
        }
        $endpoints=[
            'restaurants'=>fn()=> $this->getJson('/api/restaurants')->assertOk(),
            'foods'=>fn()=> $this->getJson('/api/foods')->assertOk(),
            'orders'=>function() use ($admin) { Auth::forgetGuards(); $this->withToken($admin)->getJson('/api/orders')->assertOk(); },
            'customers'=>function() use ($admin) { Auth::forgetGuards(); $this->withToken($admin)->getJson('/api/admin/customers')->assertOk(); },
            'riders'=>function() use ($admin) { Auth::forgetGuards(); $this->withToken($admin)->getJson('/api/admin/riders')->assertOk(); },
            'available'=>function() use ($riderToken) { Auth::forgetGuards(); $this->withToken($riderToken)->getJson('/api/rider/available-orders')->assertOk(); },
        ];
        foreach ($endpoints as $name=>$request) {
            $before=$this->countQueries($request);
            $this->addRowsFor($name);
            $after=$this->countQueries($request);
            $this->assertLessThanOrEqual($before,$after,"$name query count grew from $before to $after");
        }
    }

    private function addRowsFor(string $kind): void
    {
        if ($kind==='foods') {
            for($i=0;$i<25;$i++) { $food=Food::create(['restaurant_id'=>1,'name'=>"Count food $i",'price'=>10,'is_available'=>true]); FoodExtra::create(['food_id'=>$food->id,'name'=>'Extra','price'=>1]); }
        } elseif ($kind==='customers') {
            for($i=0;$i<25;$i++) { $u=User::create(['name'=>"Count customer $i",'email'=>"count-customer-$i@test.local",'password'=>'Passw0rd!','role'=>'customer']); Order::create(['order_number'=>"ORD-QCUS$i",'customer_id'=>$u->id,'restaurant_id'=>1,'delivery_address'=>'Home','subtotal'=>10,'delivery_fee'=>0,'discount'=>0,'total'=>10]); }
        } elseif ($kind==='riders') {
            for($i=0;$i<25;$i++) { $u=User::create(['name'=>"Count rider $i",'email'=>"count-rider-$i@test.local",'password'=>'Passw0rd!','role'=>'rider']); Rider::create(['user_id'=>$u->id,'approval_status'=>'APPROVED']); }
        } elseif ($kind==='orders' || $kind==='available') {
            $customer=User::where('role','customer')->firstOrFail();
            $food=Food::where('restaurant_id',1)->firstOrFail();
            for($i=0;$i<25;$i++) {
                $order=Order::create(['order_number'=>"ORD-Q{$kind}{$i}",'customer_id'=>$customer->id,'restaurant_id'=>1,'delivery_address'=>'Home','subtotal'=>10,'delivery_fee'=>0,'discount'=>0,'total'=>10,'status'=>$kind==='available'?'READY_FOR_PICKUP':'PLACED']);
                OrderItem::create(['order_id'=>$order->id,'food_id'=>$food->id,'name'=>$food->name,'price'=>$food->price,'quantity'=>1]);
            }
        } elseif ($kind==='restaurants') {
            for($i=0;$i<25;$i++) Restaurant::create(['owner_id'=>User::where('role','restaurant_owner')->value('id'),'name'=>"Count restaurant $i",'address'=>'Campus','approval_status'=>'APPROVED','is_open'=>true,'blocked'=>false]);
        }
    }
}
