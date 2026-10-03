# Progressive Web App

Can Cagayan Business become a Progressive Web App (PWA), and should it? Short answer: yes, it can, cheaply, but after the video. This file records what it would take so the decision is quick when the time comes.

**Status:** not started. Decision D18 in `decisions.md`.

## What a PWA adds

- **Install to the home screen.** Residents open the public map like an app, without an app store.
- **Faster repeat visits.** The app shell (JavaScript, CSS, fonts, icons) loads from the phone instead of the network.
- **A friendly offline screen** instead of the browser's error page.
- **A good pitch line.** "Works on any phone, no download from an app store" fits the Good Governance pillar.

It does not make the app work fully offline. Pages still need the server for data.

## What it takes

1. **A web app manifest** (`public/manifest.webmanifest`): name, short name, colors, start URL `/`, display `standalone`, and icons at 192 and 512 pixels, plus a maskable icon. Link it in `resources/views/app.blade.php`.
2. **A service worker** that caches the built assets in `public/build/`. The usual tool is `vite-plugin-pwa` (Workbox). Check that its current release supports Vite 8 and vite-plus before installing, and record the version in `decisions.md`.
3. **HTTPS** on the online version. Browsers allow service workers on `localhost` without it, so the booth laptop is fine.
4. **An offline page** shown when a navigation fails.

Roughly half a day for one person, plus testing on an Android phone and an iPhone.

## Rules if we build it

These matter more than the setup.

- **Never cache Capitol responses.** Admin pages contain owner names and contact numbers. A cached copy on a shared or borrowed device is a leak. Cache static assets only, and let the service worker pass every other request to the network.
- **Never cache Inertia page data.** Inertia requests carry an `X-Inertia` header and a version. Serving a cached response after a deploy shows stale pages or breaks the version check. Network only for them.
- **Cache public data with care, if at all.** Boundary shapes are a safe candidate (public, rarely change). Business listings are not worth the staleness.
- **Show the simulated label offline too**, on the offline page, if it shows any figure.
- **Version the cache** with the build, so a deploy replaces old files.
- **Make updates obvious.** When a new version is ready, show a small "Update available" prompt rather than reloading under the user.

## Recommendation

- **Before the video (by October 29):** nothing, or only the manifest and icons, so the app installs with the right name and icon. No service worker.
- **Before the booth (December 10):** the full setup above if time allows, with the caching rules. Test it on the booth laptop offline.
- **After the MVP:** consider offline public pages if residents with weak signal are a real audience.
