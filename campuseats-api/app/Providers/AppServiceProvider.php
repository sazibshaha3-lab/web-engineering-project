<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', fn (Request $request) => [
            Limit::perMinute(config('campuseats.auth_rate_limit'))
                ->by(strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(config('campuseats.auth_rate_limit') * 3)
                ->by($request->ip()),
        ]);

        RateLimiter::for('order-create', function (Request $request) {
            $accountKey = (string) ($request->user()?->id ?? $request->ip());

            return [
                Limit::perMinute(10)->by('minute:'.$accountKey),
                Limit::perHour(60)->by('hour:'.$accountKey),
            ];
        });

    }
}
