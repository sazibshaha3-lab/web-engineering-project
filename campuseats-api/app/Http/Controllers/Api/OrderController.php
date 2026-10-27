<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Food;
use App\Models\FoodExtra;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public const WITH = [
        'items',
        'review',
        'restaurant:id,name,logo,image,address,delivery_time',
        'rider.user:id,name,phone,avatar',
        'customer:id,name,phone',
    ];

    // kon role kon status theke kothay jete pare
    private const FLOW = [
        'restaurant_owner' => [
            'PLACED' => ['ACCEPTED', 'REJECTED'],
            'ACCEPTED' => ['PREPARING'],
            'PREPARING' => ['READY_FOR_PICKUP'],
        ],
        'rider' => [
            'READY_FOR_PICKUP' => ['PICKED_UP'],
            'PICKED_UP' => ['OUT_FOR_DELIVERY'],
            'OUT_FOR_DELIVERY' => ['DELIVERED'],
        ],
    ];

    private function canView(Order $order, User $user): bool
    {
        return match ($user->role) {
            'admin' => true,
            'customer' => $order->customer_id === $user->id,
            'restaurant_owner' => $user->restaurant && $order->restaurant_id === $user->restaurant->id,
            'rider' => $user->rider && $order->rider_id === $user->rider->id,
            default => false,
        };
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $q = Order::with(self::WITH)->latest();

        match ($user->role) {
            'customer' => $q->where('customer_id', $user->id),
            'restaurant_owner' => $q->where('restaurant_id', $user->restaurant?->id ?? 0),
            'rider' => $q->where('rider_id', $user->rider?->id ?? 0),
            default => null,
        };

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        return $q->get();
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($this->canView($order, $request->user()), 403);

        return $order->load(self::WITH);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'items' => 'required|array|min:1',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.quantity' => 'required|integer|min:1|max:50',
            'items.*.extras' => 'nullable|array',
            'items.*.extras.*' => 'integer',
            'items.*.custom_instructions' => 'nullable|string|max:500',
            'address_id' => 'nullable|exists:addresses,id',
            'delivery_address' => 'required_without:address_id|nullable|string',
            'delivery_instructions' => 'nullable|string',
            'payment_method' => 'required|in:cash,online',
        ]);

        $restaurant = Restaurant::findOrFail($data['restaurant_id']);
        abort_if($restaurant->approval_status !== 'APPROVED' || $restaurant->blocked, 422, 'Restaurant ekhon available nai');
        abort_if(! $restaurant->is_open, 422, 'Restaurant ekhon bondho');

        // Address er snapshot: pore customer address delete/edit korleo order e ager address thake
        $address = null;
        if (! empty($data['address_id'])) {
            $address = Address::where('user_id', $user->id)->findOrFail($data['address_id']);
            $snapshot = [
                'label' => $address->label,
                'line' => $address->line,
                'area' => $address->area,
                'city' => $address->city,
                'details' => $address->details,
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
            ];
        } else {
            $snapshot = [
                'label' => 'Delivery',
                'line' => $data['delivery_address'],
                'area' => null,
                'city' => null,
                'details' => null,
            ];
        }

        $subtotal = 0;
        $rows = [];
        foreach ($data['items'] as $item) {
            $food = Food::where('restaurant_id', $restaurant->id)
                ->where('is_available', true)
                ->find($item['food_id']);
            abort_if(! $food, 422, 'Kono food available nai ba ei restaurant er na');

            $extras = FoodExtra::where('food_id', $food->id)
                ->whereIn('id', $item['extras'] ?? [])
                ->get(['id', 'name', 'price']);

            $subtotal += ($food->price + $extras->sum('price')) * $item['quantity'];

            $rows[] = [
                'food_id' => $food->id,
                'name' => $food->name,
                'image' => $food->image,
                'price' => $food->price,
                'quantity' => $item['quantity'],
                'custom_instructions' => $item['custom_instructions'] ?? null,
                'selected_extras' => $extras->toArray(),
            ];
        }

        abort_if($subtotal < $restaurant->minimum_order, 422, "Minimum order {$restaurant->minimum_order}");

        $deliveryFee = $restaurant->delivery_fee;
        $discount = 0;

        $order = DB::transaction(function () use ($data, $user, $restaurant, $address, $snapshot, $subtotal, $deliveryFee, $discount, $rows) {
            $order = Order::create([
                'order_number' => $this->newNumber(),
                'customer_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'address_id' => $address?->id,
                'delivery_address' => $snapshot,
                'delivery_instructions' => $data['delivery_instructions'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount' => $discount,
                'total' => $subtotal + $deliveryFee - $discount,
                'payment_method' => $data['payment_method'],
                // online payment gateway nai, tai simulate kora hocche
                'payment_status' => $data['payment_method'] === 'online' ? 'PAID' : 'PENDING',
                'status' => 'PLACED',
                'estimated_delivery_time' => now()->addMinutes(45),
            ]);

            $order->items()->createMany($rows);

            return $order;
        });

        return response()->json($order->load(self::WITH), 201);
    }

    public function cancel(Request $request, Order $order)
    {
        abort_if($order->customer_id !== $request->user()->id, 403);
        abort_if($order->status !== 'PLACED', 422, 'Restaurant accept korar por cancel kora jay na');

        $order->update(['status' => 'CANCELLED']);

        return $order->load(self::WITH);
    }

    public function adminCancel(Order $order)
    {
        abort_if($order->status !== 'PLACED', 422, 'Only PLACED orders can be cancelled');

        $order->update(['status' => 'CANCELLED']);

        return $order->load(self::WITH);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $user = $request->user();
        if ($user->role === 'restaurant_owner') {
            $restaurant = $user->restaurant;
            abort_unless($restaurant && $restaurant->approval_status === 'APPROVED' && ! $restaurant->blocked,
                403, 'Your restaurant account is waiting for admin approval.');
        }
        if ($user->role === 'rider') {
            abort_unless($user->rider && $user->rider->approval_status === 'APPROVED',
                403, 'Your rider account is waiting for admin approval.');
        }
        $data = $request->validate(['status' => 'required|string']);

        abort_unless($this->canView($order, $user), 403);

        if ($user->role === 'admin') {
            // Admin can drive either side of the workflow: the same transitions,
            // never skipping a step.
            $allowed = array_merge(
                self::FLOW['restaurant_owner'][$order->status] ?? [],
                self::FLOW['rider'][$order->status] ?? []
            );
        } else {
            $flow = self::FLOW[$user->role] ?? null;
            abort_if(! $flow, 403);
            $allowed = $flow[$order->status] ?? [];
        }
        abort_if(! in_array($data['status'], $allowed, true), 422,
            "{$order->status} theke {$data['status']} e jaowa jay na");

        DB::transaction(function () use ($order, $data) {
            $order->update(['status' => $data['status']]);

            if ($data['status'] === 'DELIVERED') {
                $order->update(['payment_status' => 'PAID']);
                $order->rider?->increment('total_deliveries');
            }
        });

        return $order->fresh()->load(self::WITH);
    }

    public function review(Request $request, Order $order)
    {
        $user = $request->user();

        abort_if($order->customer_id !== $user->id, 403);
        abort_if($order->status !== 'DELIVERED', 422, 'Delivery hobar por review dewa jay');
        abort_if(Review::where('order_id', $order->id)->exists(), 422, 'Ei order e already review deya hoyeche');

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'restaurant_id' => $order->restaurant_id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $stats = Review::where('restaurant_id', $order->restaurant_id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as cnt')
            ->first();

        Restaurant::whereKey($order->restaurant_id)->update([
            'rating' => round($stats->avg_rating, 1),
            'review_count' => $stats->cnt,
        ]);

        return response()->json($review, 201);
    }

    private function newNumber(): string
    {
        do {
            $n = 'ORD-' . strtoupper(Str::random(5));
        } while (Order::where('order_number', $n)->exists());

        return $n;
    }
}
