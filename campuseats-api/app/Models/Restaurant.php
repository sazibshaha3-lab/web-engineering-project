<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'image', 'logo', 'description', 'address', 'category',
        'rating', 'review_count', 'delivery_time', 'delivery_fee', 'is_open',
        'opening_time', 'closing_time', 'minimum_order', 'approval_status', 'blocked',
    ];

    protected $casts = ['is_open' => 'boolean', 'blocked' => 'boolean'];

    public function owner()   { return $this->belongsTo(User::class, 'owner_id'); }
    public function foods()   { return $this->hasMany(Food::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function orders()  { return $this->hasMany(Order::class); }
}