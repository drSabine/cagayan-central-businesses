<?php

use App\Models\User;

// D20. The login lives only at the secret path, is never indexed, and guests elsewhere get 404.

test('the login page renders at the configured path and is not indexed', function () {
    $this->get(route('capitol.login'))
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertHeader('Referrer-Policy', 'no-referrer');

    expect(route('capitol.login', absolute: false))->toBe('/'.config('cagayan.admin.login_path'));
});

test('the usual login paths do not exist', function (string $uri) {
    $this->get($uri)->assertNotFound();
    $this->post($uri, ['email' => 'a@b.test', 'password' => 'x'])->assertNotFound();
})->with(['/login', '/admin', '/capitol/login']);

test('administrators log in at the secret path', function () {
    $user = User::factory()->create();

    $this->post(route('capitol.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
});

test('a wrong password does not log in and does not say which part was wrong', function () {
    $user = User::factory()->create();

    $this->from(route('capitol.login'))
        ->post(route('capitol.login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
        ->assertSessionHasErrors(['email' => __('auth.failed')]);

    $this->assertGuest();
});

test('repeated failed logins are rate limited', function () {
    $user = User::factory()->create();

    foreach (range(1, config('cagayan.admin.login_per_minute')) as $attempt) {
        $this->post(route('capitol.login.store'), ['email' => $user->email, 'password' => 'wrong-password']);
    }

    $this->post(route('capitol.login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
        ->assertTooManyRequests();
});

test('logged in administrators are sent away from the login page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('capitol.login'))
        ->assertRedirect();
});

test('administrators can log out', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('logout'))
        ->assertRedirect(route('home'));

    $this->assertGuest();
});

test('public pages never reveal the login path', function (string $route) {
    $this->get(route($route))
        ->assertOk()
        ->assertDontSee(config('cagayan.admin.login_path'), escape: false);
})->with(['home', 'public.wishes.index']);
