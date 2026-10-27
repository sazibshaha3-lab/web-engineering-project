<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    private function myRestaurant(Request $request)
    {
        return $request->user()->restaurant ?? abort(404, 'Restaurant nai');
    }

    public function restaurant(Request $request)
    {
        return $this->myRestaurant($request)->load('foods.extras');
    }

    public function updateRestaurant(Request $request)
    {
        $restaurant = $this->myRestaurant($request);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|string',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'address' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'delivery_time' => 'nullable|string|max:50',
            'delivery_fee' => 'nullable|numeric|min:0',
            'is_open' => 'nullable|boolean',
            'opening_time' => 'nullable|string|max:20',
            'closing_time' => 'nullable|string|max:20',
            'minimum_order' => 'nullable|numeric|min:0',
        ]);

        $restaurant->update($data);

        return $restaurant->fresh();
    }

    public function foods(Request $request)
    {
        return $this->myRestaurant($request)->foods()->with('extras')->get();
    }

    private function foodRules(bool $update = false): array
    {
        $req = $update ? 'sometimes|required' : 'required';

        return [
            'category_id' => 'nullable|exists:categories,id',
            'name' => "$req|string|max:255",
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => "$req|numeric|min:0",
            'preparation_time' => 'nullable|string|max:50',
            'is_available' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'extras' => 'nullable|array',
            'extras.*.name' => 'required|string|max:100',
            'extras.*.price' => 'required|numeric|min:0',
        ];
    }

    public function storeFood(Request $request)
    {
        $restaurant = $this->myRestaurant($request);
        $data = $request->validate($this->foodRules());

        $extras = $data['extras'] ?? [];
        unset($data['extras']);

        $food = $restaurant->foods()->create($data);
        if ($extras) {
            $food->extras()->createMany($extras);
        }

        return response()->json($food->load('extras'), 201);
    }

    public function updateFood(Request $request, Food $food)
    {
        $restaurant = $this->myRestaurant($request);
        abort_if($food->restaurant_id !== $restaurant->id, 403);

        $data = $request->validate($this->foodRules(true));

        $hasExtras = array_key_exists('extras', $data);
        $extras = $data['extras'] ?? [];
        unset($data['extras']);

        $food->update($data);

        if ($hasExtras) {
            $food->extras()->delete();
            if ($extras) {
                $food->extras()->createMany($extras);
            }
        }

        return $food->load('extras');
    }

    public function destroyFood(Request $request, Food $food)
    {
        $restaurant = $this->myRestaurant($request);
        abort_if($food->restaurant_id !== $restaurant->id, 403);

        $food->delete();

        return response()->noContent();
    }
}
