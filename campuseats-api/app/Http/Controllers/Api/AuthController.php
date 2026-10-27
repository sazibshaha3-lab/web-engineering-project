<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\Rider;
use App\Models\User;
use App\Services\GoogleTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    private function registrationOtpKey(string $email): string
    {
        return 'registration_otp:'.hash('sha256', strtolower(trim($email)));
    }

    private function registrationVerifiedKey(string $email): string
    {
        return 'registration_verified:'.hash('sha256', strtolower(trim($email)));
    }

    private function registrationDraftKey(string $email): string
    {
        return 'registration_draft:'.hash('sha256', strtolower(trim($email)));
    }

    public function sendRegistrationOtp(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $draftKey = $this->registrationDraftKey($request->input('email'));
        $draft = Cache::get($draftKey);
        if (! $draft || $request->has('password')) {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8',
                'role' => 'required|in:customer,restaurant_owner,rider,admin',
                'restaurant_name' => 'required_if:role,restaurant_owner|nullable|string|max:255',
                'restaurant_address' => 'required_if:role,restaurant_owner|nullable|string|max:255',
                'vehicle_type' => 'required_if:role,rider|nullable|string|max:50',
                'vehicle_number' => 'required_if:role,rider|nullable|string|max:50',
                'admin_invite_code' => 'required_if:role,admin|nullable|string|max:255',
            ]);
            if ($data['role'] === 'admin') {
                $inviteCode = (string) config('campuseats.admin_registration_code');
                if ($inviteCode === '' || ! hash_equals($inviteCode, (string) ($data['admin_invite_code'] ?? ''))) {
                    throw ValidationException::withMessages(['admin_invite_code' => ['The admin invitation code is invalid or has not been configured.']]);
                }
            }
            unset($data['admin_invite_code']);
            $data['password'] = Hash::make($data['password']);
            Cache::put($draftKey, $data, now()->addMinutes(15));
        } else {
            validator(['email' => $request->input('email')], ['email' => 'required|email|unique:users,email'])->validate();
            $data = $draft;
        }
        $email = $data['email'];
        $code = (string) random_int(100000, 999999);

        Mail::raw("Your CampusEats verification code is {$code}. It expires in 10 minutes.", function ($message) use ($email) {
            $message->to($email)->subject('Your CampusEats verification code');
        });

        Cache::put($this->registrationOtpKey($email), [
            'hash' => Hash::make($code),
            'attempts' => 0,
        ], now()->addMinutes(10));

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function verifyRegistrationOtp(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);
        $otpKey = $this->registrationOtpKey($data['email']);
        $otp = Cache::get($otpKey);

        if (! $otp || ($otp['attempts'] ?? 0) >= 5) {
            Cache::forget($otpKey);
            throw ValidationException::withMessages(['code' => ['The code expired. Request a new one.']]);
        }

        if (! Cache::has($this->registrationDraftKey($data['email']))) {
            Cache::forget($otpKey);
            throw ValidationException::withMessages(['email' => ['Your registration session expired. Please register again.']]);
        }

        if (! Hash::check($data['code'], $otp['hash'])) {
            $otp['attempts']++;
            Cache::put($otpKey, $otp, now()->addMinutes(10));
            throw ValidationException::withMessages(['code' => ['Incorrect verification code. Please try again.']]);
        }

        Cache::put($this->registrationVerifiedKey($data['email']), true, now()->addMinutes(10));
        Cache::forget($otpKey);

        return response()->json(['message' => 'Email verified.']);
    }

    public function register(Request $request)
    {
        // email ek format e rakhi (lowercase, trim)
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);

        $request->validate(['email' => 'required|email']);
        $email = $request->input('email');

        $verifiedKey = $this->registrationVerifiedKey($email);
        if (! Cache::get($verifiedKey)) {
            throw ValidationException::withMessages([
                'email' => ['Verify your email before creating an account.'],
            ]);
        }

        $data = Cache::get($this->registrationDraftKey($email));
        if (! $data) {
            Cache::forget($verifiedKey);
            throw ValidationException::withMessages(['email' => ['Your registration session expired. Please register again.']]);
        }

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'], // model er 'hashed' cast nijei hash korbe
                'role' => $data['role'],
                'email_verified_at' => now(),
            ]);

            if ($data['role'] === 'restaurant_owner') {
                Restaurant::create([
                    'owner_id' => $user->id,
                    'name' => $data['restaurant_name'],
                    'address' => $data['restaurant_address'],
                    'approval_status' => 'PENDING',
                ]);
            }

            if ($data['role'] === 'rider') {
                Rider::create([
                    'user_id' => $user->id,
                    'vehicle_type' => $data['vehicle_type'],
                    'vehicle_number' => $data['vehicle_number'],
                    'approval_status' => 'PENDING',
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;
        Cache::forget($verifiedKey);
        Cache::forget($this->registrationDraftKey($email));

        return response()->json([
            'user' => $user->load(['restaurant', 'rider']),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);

        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Blocked customer login korte parbe na
        if ($user->status === 'blocked') {
            throw ValidationException::withMessages([
                'email' => ['This account has been blocked. Contact CampusEats support for help.'],
            ]);
        }

        // Admin jar rider account block koreche
        if ($user->role === 'rider' && $user->rider?->approval_status === 'BLOCKED') {
            throw ValidationException::withMessages([
                'email' => ['This rider account has been blocked. Contact CampusEats support for help.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load(['restaurant', 'rider']),
            'token' => $token,
        ]);
    }

    public function loginWithGoogle(Request $request)
    {
        $data = $request->validate([
            'credential' => 'required|string|max:10000',
        ]);

        $clientId = (string) config('services.google.client_id');
        if ($clientId === '') {
            abort(503, 'Google sign-in is not configured on this server.');
        }

        try {
            $claims = app(GoogleTokenVerifier::class)->verify($data['credential'], [
                'audience' => $clientId,
                'throwException' => true,
            ]);
        } catch (Throwable $exception) {
            report($exception);
            abort(503, 'Could not verify your Google account. Please try again.');
        }

        if (! is_array($claims)
            || ! in_array($claims['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
            || empty($claims['sub'])
            || empty($claims['email'])
            || ! filter_var($claims['email'], FILTER_VALIDATE_EMAIL)
            || ! filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            throw ValidationException::withMessages([
                'credential' => ['Google could not verify this account. Please choose a verified Google email.'],
            ]);
        }

        $email = strtolower(trim($claims['email']));
        $googleId = (string) $claims['sub'];
        $user = User::where('google_id', $googleId)->first();

        if (! $user) {
            $user = User::where('email', $email)->first();
            if ($user && $user->role !== 'customer') {
                throw ValidationException::withMessages([
                    'credential' => ['Unable to sign in with this Google account.'],
                ]);
            }
            if ($user && $user->google_id && ! hash_equals($user->google_id, $googleId)) {
                throw ValidationException::withMessages([
                    'credential' => ['This email is already linked to a different Google account.'],
                ]);
            }

            if ($user && ! str_ends_with($email, '@gmail.com') && empty($claims['hd'])) {
                throw ValidationException::withMessages([
                    'credential' => ['Log in with your password first to connect Google to this account.'],
                ]);
            }

            $user = DB::transaction(function () use ($user, $claims, $email, $googleId) {
                if (! $user) {
                    return User::create([
                        'name' => trim((string) ($claims['name'] ?? '')) ?: strstr($email, '@', true),
                        'email' => $email,
                        'google_id' => $googleId,
                        'email_verified_at' => now(),
                        'avatar' => $claims['picture'] ?? null,
                        'password' => Str::random(64),
                        'role' => 'customer',
                    ]);
                }

                $user->forceFill([
                    'google_id' => $googleId,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                return $user->fresh();
            });
        }

        // Google sign-in is for customers only, including previously linked accounts.
        if ($user->role !== 'customer') {
            throw ValidationException::withMessages([
                'credential' => ['Unable to sign in with this Google account.'],
            ]);
        }

        if ($user->status === 'blocked') {
            throw ValidationException::withMessages([
                'credential' => ['This account has been blocked. Contact CampusEats support for help.'],
            ]);
        }

        if ($user->role === 'rider' && $user->rider?->approval_status === 'BLOCKED') {
            throw ValidationException::withMessages([
                'credential' => ['This rider account has been blocked. Contact CampusEats support for help.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load(['restaurant', 'rider']),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        // block hoye gele purono token diye session restore korte dibo na
        if ($user->status === 'blocked') {
            $user->tokens()->delete();
            abort(401, 'This account has been blocked.');
        }

        return response()->json($user->load(['restaurant', 'rider']));
    }

    public function updateMe(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh()->load(['restaurant', 'rider']));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
