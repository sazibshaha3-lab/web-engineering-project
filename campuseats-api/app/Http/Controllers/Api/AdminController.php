<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return [
            'customers' => User::where('role', 'customer')
                ->where('email', 'not like', '%@reviewer.campuseats.test')
                ->count(),
            'restaurants' => [
                'total' => Restaurant::count(),
                'pending' => Restaurant::where('approval_status', 'PENDING')->count(),
                'approved' => Restaurant::where('approval_status', 'APPROVED')->count(),
            ],
            'riders' => [
                'total' => Rider::count(),
                'pending' => Rider::where('approval_status', 'PENDING')->count(),
                'approved' => Rider::where('approval_status', 'APPROVED')->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'delivered' => Order::where('status', 'DELIVERED')->count(),
                'active' => Order::whereNotIn('status', ['DELIVERED', 'CANCELLED', 'REJECTED'])->count(),
            ],
            'revenue' => (float) Order::where('status', 'DELIVERED')->sum('total'),
        ];
    }

    public function restaurants(Request $request)
    {
        $q = Restaurant::with('owner:id,name,email,phone')->latest();

        if ($request->filled('status')) {
            $q->where('approval_status', $request->status);
        }

        return $q->get();
    }

    public function setRestaurantApproval(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate(['approval_status' => 'required|in:PENDING,APPROVED,REJECTED']);
        $restaurant->update($data);

        return $restaurant;
    }

    public function setRestaurantBlocked(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate(['blocked' => 'required|boolean']);
        $restaurant->update($data);

        return $restaurant;
    }

    public function riders(Request $request)
    {
        $q = Rider::with('user:id,name,email,phone,avatar')->latest();

        if ($request->filled('status')) {
            $q->where('approval_status', $request->status);
        }

        return $q->get();
    }

    public function setRiderApproval(Request $request, Rider $rider)
    {
        $data = $request->validate(['approval_status' => 'required|in:PENDING,APPROVED,REJECTED,BLOCKED']);
        $rider->update($data);

        // Blocked rider er login session sathe sathe bondho
        if ($data['approval_status'] === 'BLOCKED') {
            $rider->user?->tokens()->delete();
        }

        return $rider;
    }

    public function customers()
    {
        // Seeder er toiri review-author user gulo list e dekhabe na
        return User::where('role', 'customer')
            ->where('email', 'not like', '%@reviewer.campuseats.test')
            ->withCount('orders')
            ->latest()
            ->get();
    }

    public function setCustomerStatus(Request $request, User $user)
    {
        abort_if($user->role !== 'customer', 404);

        $data = $request->validate(['status' => 'required|in:active,inactive,blocked']);
        $user->update($data);

        // Blocked hole login kora thakle sathe sathe logout
        if ($data['status'] === 'blocked') {
            $user->tokens()->delete();
        }

        return $user->loadCount('orders');
    }
}