<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\Review;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    private function visible()
    {
        return Restaurant::where('approval_status', 'APPROVED')->where('blocked', false);
    }

    public function index(Request $request)
    {
        $q = $this->visible();

        if ($request->filled('category')) {
            $q->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(fn ($x) => $x->where('name', 'like', "%{$s}%")
                ->orWhere('description', 'like', "%{$s}%"));
        }

        return $q->orderByDesc('rating')->get()->each(function (Restaurant $restaurant) {
            $restaurant->setAttribute('is_open', $restaurant->isAcceptingOrders());
        });
    }

    public function show($id)
    {
        $restaurant = $this->visible()->with('foods.extras')->findOrFail($id);
        $restaurant->setAttribute('is_open', $restaurant->isAcceptingOrders());

        return $restaurant;
    }

    public function foods($id)
    {
        $restaurant = $this->visible()->findOrFail($id);

        return $restaurant->foods()->with('extras')->get();
    }

    public function reviews($id)
    {
        $this->visible()->findOrFail($id);

        return Review::where('restaurant_id', $id)
            ->with('user:id,name,avatar')
            ->latest()
            ->get();
    }
}
