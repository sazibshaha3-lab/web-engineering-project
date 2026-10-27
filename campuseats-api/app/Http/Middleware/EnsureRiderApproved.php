<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRiderApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $rider = $request->user()?->rider;

        abort_unless($rider && $rider->approval_status === 'APPROVED',
            403, 'Your rider account is waiting for admin approval.');

        return $next($request);
    }
}
