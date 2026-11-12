<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('campuseats:admin {--name=} {--email=} {--phone=}', function () {
    $name = $this->option('name') ?: $this->ask('Admin name');
    $email = strtolower(trim($this->option('email') ?: $this->ask('Admin email')));
    $phone = $this->option('phone') ?: $this->ask('Admin phone (optional)', '');
    $password = $this->secret('Admin password (minimum 12 characters)');
    $confirmation = $this->secret('Confirm admin password');

    $validator = Validator::make(compact('name', 'email', 'phone', 'password'), [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'phone' => ['nullable', 'string', 'max:30'],
        'password' => ['required', 'string', 'min:12'],
    ]);

    if ($validator->fails()) {
        $this->error($validator->errors()->first());
        return 1;
    }
    if (! hash_equals($password, $confirmation)) {
        $this->error('The passwords do not match.');
        return 1;
    }

    User::create([
        'name' => $name,
        'email' => $email,
        'phone' => $phone ?: null,
        'password' => Hash::make($password),
        'role' => 'admin',
        'status' => 'active',
        'email_verified_at' => now(),
    ]);

    $this->info("Admin account created: {$email}");
    return 0;
})->purpose('Create an administrator without loading demo data');

Artisan::command('campuseats:production-check', function () {
    if (! app()->environment('production')) {
        $this->info('Production configuration check skipped outside production.');
        return 0;
    }

    $errors = [];
    $appUrl = (string) config('app.url');
    $allowedOrigins = config('cors.allowed_origins', []);
    $smtp = config('mail.mailers.smtp', []);
    $fromAddress = (string) config('mail.from.address');
    $isHttpsOrigin = static function (string $url): bool {
        $parts = parse_url($url);
        return is_array($parts)
            && ($parts['scheme'] ?? null) === 'https'
            && filled($parts['host'] ?? null)
            && in_array($parts['path'] ?? '', ['', '/'], true)
            && ! (isset($parts['user']) || isset($parts['pass'])
                || isset($parts['query']) || isset($parts['fragment']));
    };

    if (config('app.debug')) $errors[] = 'APP_DEBUG must be false.';
    if (config('database.default') !== 'mysql') {
        $errors[] = 'DB_CONNECTION must be mysql in production; do not use ephemeral SQLite storage.';
    }
    if (config('queue.default') !== 'database') {
        $errors[] = 'QUEUE_CONNECTION must be database so asynchronous order jobs are persisted.';
    }
    if ((int) config('queue.connections.database.retry_after', 0) <= 150) {
        $errors[] = 'DB_QUEUE_RETRY_AFTER must be greater than the queue worker timeout of 150 seconds.';
    }
    if (config('cache.default') !== 'database') {
        $errors[] = 'CACHE_STORE must be database so application instances share cache entries and locks.';
    }
    $appKey = (string) config('app.key');
    $parsedAppKey = Str::startsWith($appKey, 'base64:')
        ? base64_decode(substr($appKey, 7), true)
        : $appKey;
    if (blank($appKey) || Str::contains($appKey, 'YOUR-')
        || ! is_string($parsedAppKey)
        || ! Encrypter::supported($parsedAppKey, (string) config('app.cipher'))) {
        $errors[] = 'APP_KEY must be a valid Laravel key for the configured encryption cipher.';
    }
    if (! $isHttpsOrigin($appUrl) || Str::contains($appUrl, 'YOUR-')) {
        $errors[] = 'APP_URL must be a real HTTPS origin without a path.';
    }
    if (! is_array($allowedOrigins) || $allowedOrigins === []) {
        $errors[] = 'CORS_ALLOWED_ORIGINS must contain the production frontend origin.';
    } else {
        foreach ($allowedOrigins as $origin) {
            if (! $isHttpsOrigin((string) $origin) || $origin === '*' || Str::contains($origin, 'YOUR-')) {
                $errors[] = 'Every CORS_ALLOWED_ORIGINS entry must be a real HTTPS origin without a path.';
                break;
            }
        }
        $normalizedOrigins = array_map(static fn ($origin) => rtrim($origin, '/'), $allowedOrigins);
    }
    $smtpCredentials = (string) ($smtp['host'] ?? '').(string) ($smtp['username'] ?? '')
        .(string) ($smtp['password'] ?? '').$fromAddress;
    if (config('mail.default') !== 'smtp' || blank($smtp['host'] ?? null)
        || blank($smtp['username'] ?? null) || blank($smtp['password'] ?? null)
        || (int) ($smtp['port'] ?? 0) < 1
        || ! filter_var($fromAddress, FILTER_VALIDATE_EMAIL)
        || Str::contains($smtpCredentials, ['YOUR_', 'CHANGE_ME'])) {
        $errors[] = 'Configure a real authenticated SMTP mailer and verified MAIL_FROM_ADDRESS.';
    }
    if (filled(config('campuseats.admin_registration_code'))) {
        $errors[] = 'ADMIN_REGISTRATION_CODE must be unset in production.';
    }
    if (config('campuseats.seed_demo_accounts')) {
        $errors[] = 'SEED_DEMO_ACCOUNTS must be false in production.';
    }
    if ($errors !== []) {
        foreach ($errors as $error) $this->error($error);
        return 1;
    }

    $this->info('Required production configuration is present.');
    return 0;
})->purpose('Validate required production configuration without displaying secrets');

Artisan::command('campuseats:migrate', function () {
    // Render can start more than one web instance during a deploy. A MySQL
    // advisory lock prevents those instances from running schema changes at once.
    $database = (string) config('database.connections.'.config('database.default').'.database');
    $lockName = 'campuseats:migrate:'.substr(hash('sha256', $database), 0, 40);
    $lock = DB::selectOne('SELECT GET_LOCK(?, 60) AS acquired', [$lockName]);

    if ((int) ($lock->acquired ?? 0) !== 1) {
        $this->error('Could not acquire the database migration lock within 60 seconds.');
        return 1;
    }

    try {
        $exitCode = Artisan::call('migrate', ['--force' => true]);
        $this->output->write(Artisan::output());
        return $exitCode;
    } finally {
        DB::selectOne('SELECT RELEASE_LOCK(?) AS released', [$lockName]);
    }
})->purpose('Run database migrations while holding a shared MySQL advisory lock');
