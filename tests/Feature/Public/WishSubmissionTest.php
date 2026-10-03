<?php

use App\Models\BusinessType;
use App\Models\Municipality;
use App\Models\Wish;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

// P3 with P12 and D21. Anonymous, one new wish per cooldown, a few edits per window.

const COOKIE = 'wish_submitter';

beforeEach(function () {
    $this->town = Municipality::factory()->connected()->create(['psgc_code' => '0201529000', 'name' => 'Tuguegarao City']);
    $this->pharmacy = BusinessType::factory()->create(['code' => 'pharmacy', 'name' => 'Pharmacy']);
    $this->bakery = BusinessType::factory()->create(['code' => 'bakery', 'name' => 'Bakery']);
});

function wishPayload(array $overrides = []): array
{
    return ['town' => '0201529000', 'type' => 'pharmacy', 'reason' => null, ...$overrides];
}

function submitterToken(TestResponse $response): string
{
    return $response->getCookie(COOKIE)->getValue();
}

test('a wish is stored with only a hash of the browser token', function () {
    $response = $this->post(route('public.wishes.store'), wishPayload(['reason' => 'None nearby']))
        ->assertRedirect(route('public.wishes.index', ['town' => '0201529000', 'type' => 'pharmacy']))
        ->assertCookie(COOKIE);

    $token = submitterToken($response);
    $wish = Wish::query()->sole();

    expect($wish->submitter_hash)->toBe(hash('sha256', $token))
        ->and($wish->submitter_hash)->not->toBe($token)
        ->and($wish->reason)->toBe('None nearby');
});

test('the wishes table has nowhere to keep a name, contact, or network address', function () {
    expect(Schema::getColumnListing('wishes'))
        ->toEqualCanonicalizing(['id', 'municipality_id', 'business_type_id', 'reason', 'submitter_hash', 'created_at', 'updated_at']);
});

test('reading the page does not hand out a cookie', function () {
    $this->get(route('public.wishes.index'))->assertOk()->assertCookieMissing(COOKIE);
});

test('a browser waits out the cooldown before its next wish', function () {
    $token = submitterToken($this->post(route('public.wishes.store'), wishPayload()));

    $this->withCookie(COOKIE, $token)
        ->post(route('public.wishes.store'), wishPayload(['type' => 'bakery']))
        ->assertSessionHasErrors('wish');

    expect(Wish::query()->count())->toBe(1);

    $this->travel(config('cagayan.wishes.cooldown_days'))->days();
    $this->travel(1)->minute();

    $this->withCookie(COOKIE, $token)
        ->post(route('public.wishes.store'), wishPayload(['type' => 'bakery']))
        ->assertSessionHasNoErrors();

    expect(Wish::query()->count())->toBe(2);
});

test('a browser may edit a few times per window and then must wait', function () {
    $token = submitterToken($this->post(route('public.wishes.store'), wishPayload()));
    $wish = Wish::query()->sole();
    $edits = config('cagayan.wishes.edits_per_window');

    foreach (range(1, $edits) as $edit) {
        $this->withCookie(COOKIE, $token)
            ->put(route('public.wishes.update', $wish), wishPayload(['type' => $edit % 2 ? 'bakery' : 'pharmacy']))
            ->assertSessionHasNoErrors();
    }

    $this->withCookie(COOKIE, $token)
        ->put(route('public.wishes.update', $wish), wishPayload(['reason' => 'one more']))
        ->assertSessionHasErrors('wish');

    expect($wish->edits()->count())->toBe($edits)
        ->and($wish->fresh()->reason)->toBeNull();

    $this->travel(config('cagayan.wishes.edit_window_days'))->days();
    $this->travel(1)->minute();

    $this->withCookie(COOKIE, $token)
        ->put(route('public.wishes.update', $wish), wishPayload(['reason' => 'one more']))
        ->assertSessionHasNoErrors();

    expect($wish->fresh()->reason)->toBe('one more');
});

test('nobody else can edit a wish', function (?string $token) {
    $wish = Wish::factory()->for($this->town)->for($this->pharmacy)->create();

    $request = $token === null ? $this : $this->withCookie(COOKIE, $token);

    $request->put(route('public.wishes.update', $wish), wishPayload(['type' => 'bakery']))->assertNotFound();

    expect($wish->fresh()->business_type_id)->toBe($this->pharmacy->id);
})->with(['no cookie' => null, 'another browser' => 'someone-elses-token']);

test('a filled honeypot is rejected', function () {
    $this->post(route('public.wishes.store'), wishPayload(['website' => 'https://spam.test']))
        ->assertSessionHasErrors('website');

    expect(Wish::query()->count())->toBe(0);
});

test('unknown towns and types are rejected', function () {
    $this->post(route('public.wishes.store'), wishPayload(['town' => '9999999999', 'type' => 'casino']))
        ->assertSessionHasErrors(['town', 'type']);
});

test('the form is rate limited per network address', function () {
    config(['cagayan.wishes.per_hour_per_ip' => 2]);

    // Fresh browsers each time, as when cookies are cleared. The hourly limit still holds.
    $this->post(route('public.wishes.store'), wishPayload());
    $this->post(route('public.wishes.store'), wishPayload());
    $this->post(route('public.wishes.store'), wishPayload())->assertTooManyRequests();
});

test('the page shows the tally and only this browser its own wish', function () {
    Wish::factory()->count(2)->for($this->town)->for($this->pharmacy)->create(['reason' => 'SENTINEL-OTHER-REASON']);
    $token = submitterToken($this->post(route('public.wishes.store'), wishPayload(['reason' => 'Mine'])));

    $this->withCookie(COOKIE, $token)
        ->get(route('public.wishes.index', ['town' => '0201529000', 'type' => 'pharmacy']))
        ->assertOk()
        ->assertDontSee('SENTINEL-OTHER-REASON')
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/wishes/index')
            ->where('page.tally.wishCount', 3)
            ->where('page.tally.registeredCount', null)
            ->where('page.myWish.reason', 'Mine')
            ->where('page.myWish.editsLeft', config('cagayan.wishes.edits_per_window'))
            ->whereNot('page.nextWishAt', null));
});

test('another browser sees the count but not the wish or its reason', function () {
    Wish::factory()->for($this->town)->for($this->pharmacy)->create(['reason' => 'SENTINEL-OTHER-REASON']);

    $this->get(route('public.wishes.index', ['town' => '0201529000', 'type' => 'pharmacy']))
        ->assertDontSee('SENTINEL-OTHER-REASON')
        ->assertInertia(fn (Assert $page) => $page
            ->where('page.tally.wishCount', 1)
            ->where('page.myWish', null)
            ->where('page.nextWishAt', null));
});
