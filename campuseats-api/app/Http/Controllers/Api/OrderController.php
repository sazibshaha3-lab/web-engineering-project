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
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\OrderNotifications;

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
            'restaurant_owner' => $user->restaurant
                && $order->restaurant_id === $user->restaurant->id
                && $user->restaurant->approval_status === 'APPROVED'
                && ! $user->restaurant->blocked,
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
            'restaurant_owner' => $q->where('restaurant_id', $user->restaurant?->id ?? 0)
                ->whereHas('restaurant', fn ($restaurant) => $restaurant
                    ->where('approval_status', 'APPROVED')->where('blocked', false)),
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

        $order->load(self::WITH);
        return $order;
    }

    public function showByNumber(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        abort_unless($this->canView($order, $request->user()), 403);

        return $order->load(self::WITH);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'items' => 'required|array|min:1|max:50',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.quantity' => 'required|integer|min:1|max:50',
            'items.*.extras' => 'nullable|array|max:20',
            'items.*.extras.*' => 'integer|distinct',
            'items.*.custom_instructions' => 'nullable|string|max:500',
            'address_id' => 'nullable|exists:addresses,id',
            'delivery_address' => 'required_without:address_id|nullable|string|max:1000',
            'delivery_instructions' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:cash',
            'idempotency_key' => 'nullable|uuid',
        ]);

        $fingerprintData = $data;
        unset($fingerprintData['idempotency_key']);
        $idempotencyHash = hash('sha256', json_encode($fingerprintData, JSON_THROW_ON_ERROR));

        if (! empty($data['idempotency_key'])) {
            $existing = Order::where('customer_id', $user->id)
                ->where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing) return $this->existingOrderResponse($existing, $idempotencyHash);
        }

        try {
            $result = DB::transaction(function () use ($data, $user, $idempotencyHash) {
                if (! empty($data['idempotency_key'])) {
                    $existing = Order::where('customer_id', $user->id)
                        ->where('idempotency_key', $data['idempotency_key'])->first();
                    if ($existing) {
                        app(OrderNotifications::class)->recordRestaurantNewOrder($existing);
                        return ['existing' => $existing];
                    }
                }

                // Serialize checkout against restaurant and menu edits so price/availability snapshots are consistent.
                $restaurant = Restaurant::lockForUpdate()->findOrFail($data['restaurant_id']);
                abort_if($restaurant->approval_status !== 'APPROVED' || $restaurant->blocked, 422, 'Restaurant ekhon available nai');
                abort_if(! $restaurant->isAcceptingOrders(), 422, 'Restaurant ekhon bondho ba tar service hours er baire');

                // Address snapshot: later edits or deletion do not alter an existing order.
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
                        ->lockForUpdate()
                        ->find($item['food_id']);
                    abort_if(! $food, 422, 'Kono food available nai ba ei restaurant er na');

                    $extras = FoodExtra::where('food_id', $food->id)
                        ->whereIn('id', $item['extras'] ?? [])
                        ->lockForUpdate()
                        ->get(['id', 'name', 'price']);
                    abort_if($extras->count() !== count($item['extras'] ?? []), 422,
                        'One or more selected extras are unavailable for this food.');

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
                abort_if($subtotal + $deliveryFee - $discount > 99999999.99, 422,
                    'This order exceeds the maximum supported total.');

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
                    'idempotency_key' => $data['idempotency_key'] ?? null,
                    'idempotency_hash' => ! empty($data['idempotency_key']) ? $idempotencyHash : null,
                    'payment_status' => 'PENDING',
                    'status' => 'PLACED',
                    'estimated_delivery_time' => now()->addMinutes(45),
                ]);

                $order->items()->createMany($rows);
                app(OrderNotifications::class)->recordRestaurantNewOrder($order);

                return ['order' => $order];
            }, 3);
            if (isset($result['existing'])) {
                return $this->existingOrderResponse($result['existing'], $idempotencyHash);
            }
            $order = $result['order'];
        } catch (QueryException $exception) {
            if (! empty($data['idempotency_key'])) {
                $existing = Order::where('customer_id', $user->id)
                    ->where('idempotency_key', $data['idempotency_key'])->first();
                if ($existing) {
                    app(OrderNotifications::class)->recordRestaurantNewOrder($existing);
                    return $this->existingOrderResponse($existing, $idempotencyHash);
                }
            }
            throw $exception;
        }

        app(OrderNotifications::class)->restaurantNewOrder($order);
        return response()->json($order->load(self::WITH), 201);
    }

    public function cancel(Request $request, Order $order)
    {
        DB::transaction(function () use ($request, $order) {
            $lockedOrder = Order::lockForUpdate()->findOrFail($order->id);
            abort_if($lockedOrder->customer_id !== $request->user()->id, 403);
            abort_if($lockedOrder->status !== 'PLACED', 422, 'Restaurant accept korar por cancel kora jay na');
            $lockedOrder->update(['status' => 'CANCELLED']);
        });
        $order->refresh();
        app(OrderNotifications::class)->customerStatusChanged($order);

        return $order->load(self::WITH);
    }

    private function existingOrderResponse(Order $order, string $idempotencyHash)
    {
        if (! $order->idempotency_hash || ! hash_equals($order->idempotency_hash, $idempotencyHash)) {
            return response()->json([
                'message' => 'This checkout key was already used for different order details. Check My Orders before starting another checkout.',
                'reason' => 'IDEMPOTENCY_CONFLICT',
            ], 409);
        }

        return response()->json($order->load(self::WITH));
    }

    public function adminCancel(Order $order)
    {
        DB::transaction(function () use ($order) {
            $lockedOrder = Order::lockForUpdate()->findOrFail($order->id);
            abort_if($lockedOrder->status !== 'PLACED', 422, 'Only PLACED orders can be cancelled');
            $lockedOrder->update(['status' => 'CANCELLED']);
        });
        $order->refresh();
        app(OrderNotifications::class)->customerStatusChanged($order);

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
        $data = $request->validate([
            'status' => 'required|string',
            'cash_collected' => 'sometimes|boolean',
        ]);

        DB::transaction(function () use ($order, $data, $user) {
            $lockedOrder = Order::lockForUpdate()->findOrFail($order->id);
            abort_unless($this->canView($lockedOrder, $user), 403);
            if ($user->role === 'admin') {
                // Admin can drive either side of the workflow, but still cannot skip a transition.
                $allowed = array_merge(
                    self::FLOW['restaurant_owner'][$lockedOrder->status] ?? [],
                    self::FLOW['rider'][$lockedOrder->status] ?? []
                );
            } else {
                $flow = self::FLOW[$user->role] ?? null;
                abort_if(! $flow, 403);
                $allowed = $flow[$lockedOrder->status] ?? [];
            }
            abort_if(! in_array($data['status'], $allowed, true), 422,
                "{$lockedOrder->status} theke {$data['status']} e jaowa jay na");

            if ($data['status'] === 'DELIVERED') {
                abort_unless((bool) ($data['cash_collected'] ?? false), 422,
                    'Confirm that the cash payment was collected before completing this delivery.');
            }

            $lockedOrder->update(['status' => $data['status']]);

            if ($data['status'] === 'DELIVERED') {
                $lockedOrder->update([
                    'payment_status' => 'PAID',
                    'delivered_at' => now(),
                ]);
                $lockedOrder->rider?->increment('total_deliveries');
            }
        });

        $order->refresh();
        app(OrderNotifications::class)->customerStatusChanged($order);

        return $order->fresh()->load(self::WITH);
    }

    public function review(Request $request, Order $order)
    {
        $user = $request->user();
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = DB::transaction(function () use ($order, $user, $data) {
            $lockedOrder = Order::lockForUpdate()->findOrFail($order->id);
            abort_if($lockedOrder->customer_id !== $user->id, 403);
            abort_if($lockedOrder->status !== 'DELIVERED', 422, 'Delivery hobar por review dewa jay');
            abort_if(Review::where('order_id', $lockedOrder->id)->exists(), 422,
                'Ei order e already review deya hoyeche');

            // Serialize rating aggregation across different orders for the same restaurant.
            $restaurant = Restaurant::lockForUpdate()->findOrFail($lockedOrder->restaurant_id);
            $review = Review::create([
                'restaurant_id' => $restaurant->id,
                'user_id' => $user->id,
                'order_id' => $lockedOrder->id,
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
            ]);

            $stats = Review::where('restaurant_id', $restaurant->id)
                ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as cnt')
                ->first();

            $restaurant->update([
                'rating' => round($stats->avg_rating, 1),
                'review_count' => $stats->cnt,
            ]);

            return $review;
        }, 3);

        return response()->json($review, 201);
    }

    private function newNumber(): string
    {
        do {
            $n = 'ORD-' . strtoupper(Str::random(10));
        } while (Order::where('order_number', $n)->exists());

        return $n;
    }
}
