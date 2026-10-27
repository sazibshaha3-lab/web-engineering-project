<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

   protected $fillable = ['name', 'email', 'google_id', 'phone', 'avatar', 'role', 'status', 'password', 'email_verified_at'];

    protected $hidden = ['password', 'remember_token', 'google_id'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function restaurant() { return $this->hasOne(Restaurant::class, 'owner_id'); }
    public function rider()      { return $this->hasOne(Rider::class); }
    public function addresses()  { return $this->hasMany(Address::class); }
    public function orders()     { return $this->hasMany(Order::class, 'customer_id'); }
}
