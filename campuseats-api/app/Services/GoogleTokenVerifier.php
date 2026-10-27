<?php

namespace App\Services;

use Google\Auth\AccessToken;

class GoogleTokenVerifier
{
    public function verify(string $credential, array $options): array|false
    {
        return (new AccessToken())->verify($credential, $options);
    }
}
