<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

/**
 * An anonymous browser token in an encrypted, http-only cookie (decisions.md, D21).
 * Only its SHA-256 hash is stored. No name, contact, or network address (P12).
 */
trait IdentifiesWishSubmitter
{
    public const string SUBMITTER_COOKIE = 'wish_submitter';

    public function submitterHash(): ?string
    {
        $token = $this->cookie(self::SUBMITTER_COOKIE);

        return is_string($token) && $token !== '' ? hash('sha256', $token) : null;
    }

    /**
     * The hash for this browser, issuing a new cookie on its first wish.
     * Visitors who only read the page are never given one.
     */
    public function submitterHashOrStart(): string
    {
        $hash = $this->submitterHash();

        if ($hash !== null) {
            return $hash;
        }

        $token = Str::random(40);

        Cookie::queue(Cookie::make(
            name: self::SUBMITTER_COOKIE,
            value: $token,
            minutes: (int) config('cagayan.wishes.cookie_days') * 24 * 60,
            httpOnly: true,
            sameSite: 'lax',
        ));

        return hash('sha256', $token);
    }
}
