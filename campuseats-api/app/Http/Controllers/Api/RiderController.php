<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class RiderController extends Controller
{
    public function available()
    {
        return Order::with(OrderController::WITH)
            ->where('status', 'READY_FOR_PICKUP')
            ->whereNull('rider_id')
            ->latest()
            ->get();
    }

    public function claim(Request $request, $id)
    {
        $rider = $request->user()->rider;
        abort_if(! $rider || $rider->approval_status !== 'APPROVED', 403, 'Rider ekhono approved na');

        // atomic update: two riders at the same time -> only one wins
        $updated = Order::where('id', $id)
            ->whereNull('rider_id')
            ->where('status', 'READY_FOR_PICKUP')
            ->update(['rider_id' => $rider->id]);

        abort_if(! $updated, 409, 'Order ta ar available nai');

        return Order::with(OrderController::WITH)->find($id);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $rider = $user->rider ?? abort(404);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'vehicle_type' => 'nullable|string|max:50',
            'vehicle_number' => 'nullable|string|max:50',
        ]);

        $userFields = array_intersect_key($data, array_flip(['name', 'phone']));
        $riderFields = array_intersect_key($data, array_flip(['vehicle_type', 'vehicle_number']));

        if ($userFields) {
            $user->update($userFields);
        }
        if ($riderFields) {
            $rider->update($riderFields);
        }

        return $rider->fresh()->load('user:id,name,email,phone,avatar');
    }
}
