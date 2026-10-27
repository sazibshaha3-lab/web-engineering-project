<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    private function validated(Request $request, bool $update = false): array
    {
        $req = $update ? 'sometimes|required' : 'required';

        return $request->validate([
            'label' => "$req|string|max:50",
            'line' => "$req|string|max:255",
            'area' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'details' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_default' => 'nullable|boolean',
        ]);
    }

    public function index(Request $request)
    {
        return $request->user()->addresses()->orderByDesc('is_default')->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $this->validated($request);

        if (! $user->addresses()->exists()) {
            $data['is_default'] = true;
        }

        return DB::transaction(function () use ($user, $data) {
            if (! empty($data['is_default'])) {
                $user->addresses()->update(['is_default' => false]);
            }

            return response()->json($user->addresses()->create($data), 201);
        });
    }

    public function update(Request $request, Address $address)
    {
        abort_if($address->user_id !== $request->user()->id, 403);
        $data = $this->validated($request, true);

        DB::transaction(function () use ($request, $address, $data) {
            if (! empty($data['is_default'])) {
                $request->user()->addresses()->update(['is_default' => false]);
            }
            $address->update($data);
        });

        return $address->fresh();
    }

    public function destroy(Request $request, Address $address)
    {
        abort_if($address->user_id !== $request->user()->id, 403);
        $address->delete();

        return response()->noContent();
    }
}
