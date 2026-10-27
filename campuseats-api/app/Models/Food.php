<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    protected $table = 'foods';

    protected $fillable = [
        'restaurant_id', 'category_id', 'name', 'image', 'description', 'price',
        'rating', 'review_count', 'preparation_time', 'is_available', 'is_popular',
    ];

    protected $casts = ['is_available' => 'boolean', 'is_popular' => 'boolean'];

    public function restaurant() { return $this->belongsTo(Restaurant::class); }
    public function category()   { return $this->belongsTo(Category::class); }
    public function extras()     { return $this->hasMany(FoodExtra::class); }
}