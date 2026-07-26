# Site Guidance

## Purpose

Keyflare Studio is the public brand for a static product hub operated by Dmitrii Semenov,
Individual Entrepreneur, Armenia.

The site exists to provide:

- a public home for apps, games, desktop apps, and software tools;
- stable store-facing URLs for Google Play, App Store Connect, App Review, and similar services;
- product-specific privacy, support, and data deletion pages;
- the root `app-ads.txt` file for AdMob;
- lightweight legal and contact presence for the operator.

The site is not a CMS, blog platform, marketing portal, admin system, or backend application.

## Public Identity

Use **Keyflare Studio** as the user-facing product identity.

Keep the legal operator clearly available in footer, legal pages, website privacy pages, and product
privacy policies:

```text
Dmitrii Semenov, Individual Entrepreneur, Armenia
```

The site should avoid exposing more public personal or business details than are intentionally
configured in `app/content/site.ts`.

## Static Architecture

The website is a fully static React application:

- React + TypeScript.
- React Router framework mode with static prerendering.
- Vite-based build tooling.
- CSS Modules and global CSS design tokens.
- GitHub Pages hosting.
- GitHub Actions checks and deployment.

Do not add:

- backend services;
- CMS packages;
- admin panels;
- runtime filesystem reads for public content;
- runtime server dependencies;
- hash-based public URLs;
- client-only routing for store-facing or compliance-facing pages.

All source content should remain versioned in git.

## Public URL Model

Canonical content is English. The current public route model is:

```text
/
/products/
/products/:slug/
/products/:slug/privacy/
/products/:slug/terms/
/products/:slug/support/
/products/:slug/data-deletion/
/contact/
/privacy/
/legal/
/app-ads.txt
```

The data deletion route is generated only for products that require it.

All store-facing and compliance-facing pages must be directly reachable as static prerendered pages.
Do not rely on SPA fallback behavior for product privacy, support, legal, or data deletion URLs.

Future localization may add routes such as `/ru/...`, but English remains the default canonical
content until localization is explicitly implemented.

## Metadata And Static Output

`robots.txt` and `sitemap.xml` are generated from site config and prerender paths.

Use:

```bash
npm run generate:static
```

Do not hand-maintain generated metadata when it should come from
`scripts/generate-static-metadata.ts`.

After build, verify static output with:

```bash
npm run check:routes
```

Generated metadata and sitemap output must exclude draft and fixture products.

## Custom 404 Output

GitHub Pages serves unknown paths from the root `404.html` file. The production build generates this
file after React Router finishes:

1. React Router emits `build/client/__spa-fallback.html` because `ssr` is disabled and `/` is
   prerendered.
2. `scripts/generate-404-page.ts` copies that fallback byte-for-byte to
   `build/client/404.html`.
3. `scripts/check-routes.ts` verifies that `404.html` exists with the other required root files.

The root `HydrateFallback` must render useful missing-page content and navigation so `404.html`
remains useful before client hydration. The root `ErrorBoundary` must route both unmatched
locations and route-generated `404` responses to the shared not-found page while keeping unexpected
non-404 errors visually and semantically distinct.

Do not add the 404 page to `getPrerenderPaths()` or `sitemap.xml`. Public product and compliance
routes must continue to be individually prerendered; the SPA fallback is only for genuinely missing
paths.

## Compliance-Sensitive Files

Preserve these files carefully:

- `public/CNAME`
- `public/app-ads.txt`

Current expected values:

```text
public/CNAME
www.keyflare.studio
```

```text
public/app-ads.txt
google.com, pub-9754850090036735, DIRECT, f08c47fec0942fa0
```

These files must be present in `build/client/` after `npm run build`.

`scripts/check-routes.ts` should continue checking for both files.
