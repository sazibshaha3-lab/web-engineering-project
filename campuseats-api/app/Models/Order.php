<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'restaurant_id', 'rider_id', 'address_id',
        'delivery_address', 'delivery_instructions', 'subtotal', 'delivery_fee',
        'discount', 'total', 'payment_method', 'payment_status', 'status',
        'estimated_delivery_time',
    ];

    protected $casts = [
        'estimated_delivery_time' => 'datetime',
        'delivery_address' => 'array',
    ];

    public function customer()   { return $this->belongsTo(User::class, 'customer_id'); }
    public function restaurant() { return $this->belongsTo(Restaurant::class); }
    public function rider()      { return $this->belongsTo(Rider::class); }
    public function address()    { return $this->belongsTo(Address::class); }
    public function items()      { return $this->hasMany(OrderItem::class); }
    public function review()     { return $this->hasOne(Review::class); }
}