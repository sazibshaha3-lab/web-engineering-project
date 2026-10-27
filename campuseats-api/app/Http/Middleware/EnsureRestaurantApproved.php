<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRestaurantApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $restaurant = $request->user()?->restaurant;

        abort_unless($restaurant && $restaurant->approval_status === 'APPROVED' && ! $restaurant->blocked,
            403, 'Your restaurant account is waiting for admin approval.');

        return $next($request);
    }
}
