<?php

// Only login and logout are kept from the starter kit (decisions.md, O8).

test('removed starter kit pages are not available', function (string $uri) {
    $this->get($uri)->assertNotFound();
})->with([
    'password reset' => '/forgot-password',
    'email verification' => '/email/verify',
    'two-factor challenge' => '/two-factor-challenge',
    'passkey login' => '/passkeys/login/options',
    'profile settings' => '/settings/profile',
    'security settings' => '/settings/security',
    'appearance settings' => '/settings/appearance',
]);
