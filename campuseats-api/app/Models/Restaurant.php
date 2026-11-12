<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'image', 'logo', 'description', 'address', 'category',
        'rating', 'review_count', 'delivery_time', 'delivery_fee', 'is_open',
        'opening_time', 'closing_time', 'minimum_order', 'approval_status', 'blocked',
    ];

    protected $casts = ['is_open' => 'boolean', 'blocked' => 'boolean'];

    public function owner()   { return $this->belongsTo(User::class, 'owner_id'); }
    public function foods()   { return $this->hasMany(Food::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function orders()  { return $this->hasMany(Order::class); }

    public function isAcceptingOrders(): bool
    {
        if (! $this->getRawOriginal('is_open')) return false;

        if (app()->environment(['local', 'testing', 'staging'])) {
            return true;
        }

        $opening = trim((string) $this->opening_time);
        $closing = trim((string) $this->closing_time);
        if ($opening === '' && $closing === '') return true; // no schedule configured; manual toggle controls availability
        if ($opening === '' || $closing === '') return false;

        $timezone = 'Asia/Dhaka';
        $parse = static function (string $time) use ($timezone): ?Carbon {
            $normalized = preg_replace('/\s+/', ' ', strtoupper(trim($time)));
            $normalized = preg_replace('/(\d)\s*(AM|PM)$/', '$1 $2', $normalized);
            foreach (['g:i A', 'h:i A', 'H:i'] as $format) {
                try {
                    $parsed = Carbon::createFromFormat('!'.$format, $normalized, $timezone);
                    $errors = Carbon::getLastErrors();
                    if ($parsed && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))) {
                        return $parsed;
                    }
                } catch (\Throwable) {
                    // Try the next supported legacy/time-input format.
                }
            }
            return null;
        };

        $start = $parse($opening);
        $end = $parse($closing);
        if (! $start || ! $end || $start->format('H:i') === $end->format('H:i')) return false;

        $current = Carbon::now($timezone)->format('H:i');
        $startTime = $start->format('H:i');
        $endTime = $end->format('H:i');

        // A closing time earlier than opening means service runs overnight (e.g. 11:00 AM–1:00 AM).
        return $startTime < $endTime
            ? $current >= $startTime && $current < $endTime
            : $current >= $startTime || $current < $endTime;
    }
}
