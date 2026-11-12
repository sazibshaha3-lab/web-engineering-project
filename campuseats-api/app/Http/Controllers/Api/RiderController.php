<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Rider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RiderController extends Controller
{
    public function available(Request $request)
    {
        $rider = $request->user()->rider;
        abort_unless($rider && $rider->approval_status === 'APPROVED' && $rider->is_available,
            403, 'Approved riders must set their status to available first.');

        return Order::query()
            ->select(['id', 'order_number', 'restaurant_id', 'total', 'delivery_address', 'created_at'])
            ->with('restaurant:id,name,delivery_time')
            ->where('status', 'READY_FOR_PICKUP')
            ->whereNull('rider_id')
            ->latest()
            ->get()
            ->map(function (Order $order) {
                $address = $order->delivery_address ?? [];

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'restaurant_id' => $order->restaurant_id,
                    'restaurant' => $order->restaurant,
                    'total' => $order->total,
                    'created_at' => $order->created_at,
                    // Give riders a coarse area for deciding whether to accept; reveal the full address only after claim.
                    'delivery_address' => array_filter([
                        'label' => $address['label'] ?? null,
                        'area' => $address['area'] ?? null,
                        'city' => $address['city'] ?? null,
                    ], static fn ($value) => $value !== null && $value !== ''),
                ];
            });
    }

    public function claim(Request $request, $id)
    {
        $rider = $request->user()->rider;
        abort_if(! $rider, 403, 'Rider ekhono approved na');

        // Serialize claims against availability changes; only one rider can claim an order.
        $updated = DB::transaction(function () use ($rider, $id) {
            $lockedRider = Rider::lockForUpdate()->findOrFail($rider->id);
            abort_unless($lockedRider->approval_status === 'APPROVED' && $lockedRider->is_available,
                403, 'Set your rider status to available before claiming an order.');

            return Order::where('id', $id)
                ->whereNull('rider_id')
                ->where('status', 'READY_FOR_PICKUP')
                ->update(['rider_id' => $lockedRider->id]);
        });

        abort_if(! $updated, 409, 'Order ta ar available nai');

        return Order::with(OrderController::WITH)->find($id);
    }

    public function updateAvailability(Request $request)
    {
        $rider = $request->user()->rider;
        abort_if(! $rider, 403, 'Rider ekhono approved na');

        $data = $request->validate(['is_available' => 'required|boolean']);
        DB::transaction(function () use ($rider, $data) {
            $lockedRider = Rider::lockForUpdate()->findOrFail($rider->id);
            abort_unless($lockedRider->approval_status === 'APPROVED', 403, 'Rider ekhono approved na');
            $lockedRider->update(['is_available' => $data['is_available']]);
        });

        return response()->json(['is_available' => $rider->fresh()->is_available]);
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
