<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    private function visible()
    {
        return Food::with(['extras', 'restaurant:id,name'])
            ->whereHas('restaurant', fn ($q) => $q
                ->where('approval_status', 'APPROVED')
                ->where('blocked', false));
    }

    public function index(Request $request)
    {
        $q = $this->visible();

        if ($request->filled('restaurant_id')) $q->where('restaurant_id', $request->restaurant_id);
        if ($request->filled('category_id'))   $q->where('category_id', $request->category_id);
        if ($request->boolean('popular'))      $q->where('is_popular', true);
        if ($request->filled('search'))        $q->where('name', 'like', "%{$request->search}%");

        return $q->get();
    }

    public function show($id)
    {
        return $this->visible()->findOrFail($id);
    }
}