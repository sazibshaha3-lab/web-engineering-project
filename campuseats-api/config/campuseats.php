<?php

return [
    'admin_password' => env('ADMIN_PASSWORD', 'Admin123!'),
    'admin_registration_code' => env('ADMIN_REGISTRATION_CODE', ''),
    'auth_rate_limit' => (int) env('AUTH_RATE_LIMIT', 10),
    'seed_demo_accounts' => (bool) env('SEED_DEMO_ACCOUNTS', true),
];
