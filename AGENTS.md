# AGENTS.md

## Repository Purpose

This repository contains the official static website for **Keyflare Studio**, operated by Dmitrii Semenov, Individual Entrepreneur, Armenia.

The site is intended to serve as:

- a product hub for mobile apps, games, desktop apps, and software tools;
- a stable source of store-facing URLs for Google Play, App Store Connect, and similar services;
- a home for product-specific privacy policies, support pages, and data deletion pages;
- the root domain source for AdMob `app-ads.txt`;
- a lightweight legal/contact presence for the operator.

This is not a CMS-backed site and should not gain a backend unless the owner explicitly changes that direction.

## Current Architecture

The site is a fully static React application:

- React + TypeScript.
- React Router framework mode with static prerendering.
- Vite-based build tooling.
- CSS Modules plus global CSS design tokens.
- GitHub Pages hosting.
- GitHub Actions checks and deployment.

Important source areas:

- `app/routes.ts` defines the route map.
- `app/routes/` contains route modules.
- `app/components/` contains reusable UI components.
- `app/styles/tokens.css` and `app/styles/global.css` contain global styling foundations.
- `app/content/site.ts` contains site-wide brand/operator config.
- `app/content/products/` contains product metadata, validation, privacy blocks, and fixture content.
- `scripts/validate-content.ts` validates product/content data.
- `scripts/generate-static-metadata.ts` generates `robots.txt` and `sitemap.xml`.
- `scripts/check-routes.ts` verifies build output.
- `docs/superpowers/specs/` contains approved concept/spec documents.
- `docs/superpowers/plans/` contains implementation plans and future work handoffs.

Generated or installed directories such as `build/`, `.react-router/`, and `node_modules/` should not be edited manually.

## Branching And Deployment

`main` is the production branch.

Before making direct codebase changes, inspect the current git state.

If the worktree is in detached `HEAD`, create a task branch first.

Branch names for agent-created work branches must use the format `codex/<work-description>`, where `<work-description>` is 1 to 5 short kebab-case words that summarize the task, for example `codex/add-product-page`.

If the worktree is already on a named branch, continue using that branch unless the user explicitly asks to switch or create another one.

Deployment behavior:

- Local merge into `main` does not deploy by itself.
- Pushing to `origin/main` starts the GitHub Pages deployment workflow.
- Merging a PR into `main` also starts deployment.
- Feature branches run checks but do not deploy.

Before merging or pushing to `main`, run:

```bash
npm run check
```

## Required Local Commands

Common development commands:

```bash
npm install
npm run dev
```

Production-like local verification:

```bash
npm run check
npm run preview -- --listen tcp://127.0.0.1:4173
```

Individual checks:

```bash
npm run validate:content
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run check:routes
```

`npm run check` is the main release gate. It runs content validation, typecheck, lint, formatting check, tests, build, and route-output checks.

## Product Publication Rules

Products are controlled by `app/content/products/registry.ts`.

Product statuses:

- `published`: public, included in product routes, prerender output, sitemap, and route checks.
- `draft`: not public.
- `fixture`: development/test-only and not public.

Never let `draft` or `fixture` products render through public product routes.

Public product routes must use a published-only lookup such as `findPublishedProduct()` or an equivalent guard.

`getPrerenderPaths()` must include:

- static public routes;
- product routes for `published` products only.

It must not include draft or fixture product paths.

## Product Pages

Current public product routes:

- `/products/`
- `/products/:slug/`
- `/products/:slug/privacy/`
- `/products/:slug/support/`
- `/products/:slug/data-deletion/` when enabled by the product privacy profile.

Privacy pages should keep generated compliance sections from structured product metadata. Product-specific additions may be added later through the custom page/MDX work described in:

```text
docs/superpowers/plans/2026-07-04-product-page-customization.md
```

Do not replace required generated privacy sections with purely custom text unless the product compliance model is redesigned explicitly.

## Compliance-Sensitive Files

Preserve these files carefully:

- `public/CNAME`
- `public/app-ads.txt`

Current expected values:

```text
public/CNAME
www.dmitrii-semenov-ie.studio
```

```text
public/app-ads.txt
google.com, pub-9754850090036735, DIRECT, f08c47fec0942fa0
```

These files must be present in `build/client/` after `npm run build`.

`scripts/check-routes.ts` should continue checking for both files.

## Metadata And Static Output

`robots.txt` and `sitemap.xml` are generated from site config and prerender paths.

Use:

```bash
npm run generate:static
```

Do not hand-maintain generated metadata if it should come from `scripts/generate-static-metadata.ts`.

After build, verify static output with:

```bash
npm run check:routes
```

## Testing Expectations

When changing content model, routing, or deployment:

- add or update Vitest tests;
- keep fixture/draft visibility tests intact;
- run `npm run check`;
- verify public root files remain in the build output.

For UI-only style changes, at minimum run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

For anything that changes routes, metadata, product publication, or CI, run the full:

```bash
npm run check
```

## Style And UI Guidance

The current visual layer is intentionally minimal. The site has an architectural shell, not a final design.

Use:

- CSS Modules for component styles;
- global tokens in `app/styles/tokens.css`;
- existing layout/components before adding new abstractions.

Avoid introducing:

- UI frameworks;
- CMS packages;
- runtime server dependencies;
- client-only routing for store-facing URLs;
- hash-based public URLs.

Store-facing and compliance-facing pages should remain directly reachable as static prerendered pages.

## Documentation

Important docs:

- Concept spec: `docs/superpowers/specs/2026-07-03-keyflare-studio-site-concept-design.md`
- Foundation implementation plan: `docs/superpowers/plans/2026-07-03-keyflare-studio-site-foundation.md`
- Future product customization plan: `docs/superpowers/plans/2026-07-04-product-page-customization.md`

When adding major architecture or workflow changes, add or update a document in `docs/superpowers/plans/` or `docs/superpowers/specs/` rather than leaving decisions only in chat.

## Known Non-Blocking Notes

The current toolchain may print a Vite notice that `vite-tsconfig-paths` can be replaced by native `resolve.tsconfigPaths`. This is not currently blocking.

Legal/privacy text is structural placeholder content. It must be reviewed and completed before using the site for real product submissions.

`Palette Master` has been discussed as a future draft product, but product-specific implementation belongs to the future customization plan unless already implemented in the codebase.
