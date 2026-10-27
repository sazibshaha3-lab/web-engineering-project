<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\RiderController;
use Illuminate\Support\Facades\Route;

// ---------- Public ----------
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register/send-otp', [AuthController::class, 'sendRegistrationOtp']);
    Route::post('/register/verify-otp', [AuthController::class, 'verifyRegistrationOtp']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/google', [AuthController::class, 'loginWithGoogle']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/foods', [RestaurantController::class, 'foods']);
Route::get('/restaurants/{id}/reviews', [RestaurantController::class, 'reviews']);
Route::get('/foods', [FoodController::class, 'index']);
Route::get('/foods/{id}', [FoodController::class, 'show']);

// ---------- Logged in ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Orders (shob role: nijer order dekhte pare)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Customer
    Route::middleware('role:customer')->group(function () {
        Route::apiResource('addresses', AddressController::class)->except('show');
        Route::post('/orders', [OrderController::class, 'store']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('/orders/{order}/review', [OrderController::class, 'review']);
    });

    // Restaurant owner + Rider: status update
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->middleware('role:restaurant_owner,rider,admin');

    // Restaurant owner
    Route::prefix('owner')->middleware(['role:restaurant_owner', 'restaurant.approved'])->group(function () {
        Route::get('/restaurant', [OwnerController::class, 'restaurant']);
        Route::put('/restaurant', [OwnerController::class, 'updateRestaurant']);
        Route::get('/foods', [OwnerController::class, 'foods']);
        Route::post('/foods', [OwnerController::class, 'storeFood']);
        Route::put('/foods/{food}', [OwnerController::class, 'updateFood']);
        Route::delete('/foods/{food}', [OwnerController::class, 'destroyFood']);
    });

    // Rider
    Route::prefix('rider')->middleware(['role:rider', 'rider.approved'])->group(function () {
        Route::get('/available-orders', [RiderController::class, 'available']);
        Route::post('/orders/{id}/claim', [RiderController::class, 'claim']);
    });
    Route::prefix('rider')->middleware('role:rider')->group(function () {
        Route::put('/profile', [RiderController::class, 'updateProfile']);
    });

    // Admin
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/restaurants', [AdminController::class, 'restaurants']);
        Route::patch('/restaurants/{restaurant}/approval', [AdminController::class, 'setRestaurantApproval']);
        Route::patch('/restaurants/{restaurant}/blocked', [AdminController::class, 'setRestaurantBlocked']);
        Route::get('/riders', [AdminController::class, 'riders']);
        Route::patch('/riders/{rider}/approval', [AdminController::class, 'setRiderApproval']);
        Route::get('/customers', [AdminController::class, 'customers']);
        Route::patch('/customers/{user}/status', [AdminController::class, 'setCustomerStatus']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'adminCancel']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });
});
