<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoodExtra extends Model
{
    protected $fillable = ['food_id', 'name', 'price'];

    public function food() { return $this->belongsTo(Food::class); }
}