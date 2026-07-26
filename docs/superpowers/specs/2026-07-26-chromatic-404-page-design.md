# Chromatic 404 Page Design

Date: 2026-07-26

Status: Approved in brainstorming

## Summary

Keyflare Studio will use a custom 404 page built around a **chromatic print-calibration** metaphor.
The page keeps the site's approved Chromatic Poster identity while turning a missing route into an
optional tactile interaction.

The hero is a giant `404` rendered as misregistered red, amber, and blue print layers. Pointer
movement gives the layers restrained parallax. A visitor may drag the layers into alignment; when
they enter the snap threshold, the composition locks into register and plays a short hard-edged
completion animation. Navigation never depends on completing the interaction.

## Goals

- Make a missing page feel like a memorable Keyflare Studio brand moment.
- Keep the visual language consistent with the existing homepage and product hub.
- Provide an optional interaction that works with pointer and touch input.
- Keep Home and Products exits visible and usable immediately.
- Serve the same branded experience for unknown paths and route-generated `404` responses.
- Preserve the fully static React Router and GitHub Pages architecture.
- Produce a root `build/client/404.html` as part of every production build.

## Non-Goals

- No backend, analytics service, CMS, runtime data fetch, or server dependency.
- No game score, timer, persistence, sound, canvas/WebGL renderer, or physics library.
- No automatic redirect after the layers align.
- No masking of unexpected non-404 application errors as missing pages.
- No addition of the 404 page to the sitemap or primary navigation.

## Visual Direction

The page stays inside the existing Keyflare Studio system:

- warm poster-paper base and the existing background grid;
- near-black ink, hard outlines, tight radii, and offset poster shadows;
- Syne for display typography and Space Grotesk for copy and controls;
- the existing red, amber, green, and blue accent tokens;
- hard-edged chromatic strips and registration marks;
- the normal Keyflare Studio header, navigation, footer, and legal identity.

The design must not introduce dark sci-fi surfaces, a mascot world, blurred decorative blobs, soft
SaaS gradients, or a separate product-style theme.

## Content

The canonical page language remains English.

Initial state:

- eyebrow: `ERROR EDITION / 404`;
- accessible heading: `This page slipped out of register.`;
- supporting copy: `The address is real. The page isn't.`;
- primary action: `Return home`;
- secondary action: `View products`;
- interaction hint: `Drag the colour plates`;
- semantic page code: one readable `404`.

Aligned state:

- stamp: `Reality restored`;
- heading: `Beautifully wrong.`;
- supporting copy: `The page is still missing. The way home isn't.`;
- primary action remains `Return home`;
- secondary action becomes `Play again`.

Decorative duplicate `404` layers are hidden from assistive technology so the code is announced
only once.

## Page States And Interaction

### 1. Arrival

The page renders a readable misregistered `404`, explanation, and both navigation actions without
waiting for client interaction. The header and footer behave exactly as they do elsewhere.

### 2. Ambient Response

Pointer movement inside the artwork offsets the chromatic layers by a small bounded amount. The
motion is damped and stays subordinate to readability. Touch devices do not depend on hover.

### 3. Direct Manipulation

A pointer or single touch may drag a visible colour plate. The interaction owns pointer capture
only while a plate is being dragged. Movement is bounded to the artwork, and selecting text outside
the artwork remains unaffected.

When all plate origins enter a small shared alignment threshold, they magnetically snap into
register.

### 4. Aligned State

Alignment triggers:

- a short snap motion;
- a hard chromatic band crossing the composition;
- the `Reality restored` stamp;
- the aligned-state copy and `Play again` action.

It does not navigate automatically. `Play again` resets only the artwork state and does not reload
the route.

## Accessibility And Input Guarantees

- Home and Products are normal links available from first render.
- The artwork is optional and never blocks navigation or page comprehension.
- Keyboard users reach the normal links; decorative dragging controls are not inserted into the
  required tab order.
- Touch uses the same bounded drag behavior with one pointer.
- With `prefers-reduced-motion: reduce`, the page shows a static intentional misprint and suppresses
  parallax, dragging, snapping, and the crossing-band animation.
- If client JavaScript fails, the static prerender still contains the message and navigation links.
- Text, controls, focus rings, and registration marks use existing high-contrast site tokens.
- Mobile layout keeps the 404 inside the viewport and stacks copy/actions without horizontal
  scrolling.

## Component Boundaries

### `NotFoundPage`

Owns semantic content, metadata intent, page layout, links, and aligned versus initial copy. It
uses the standard `SiteShell` when rendered from the root error boundary.

Dependencies:

- `Chromatic404Artwork`;
- existing `PosterButton`;
- existing site tokens and site configuration.

It holds the small `initial | aligned` presentation state. `Chromatic404Artwork` reports alignment
through an `onAlignmentChange(aligned: boolean)` callback, and the `Play again` action calls the
artwork's exposed reset handler. This keeps route/content decisions outside the pointer geometry.

### `Chromatic404Artwork`

Owns the three visual layers and the browser-only interaction state:

- bounded pointer mapping;
- active plate dragging and pointer capture;
- snap-threshold detection;
- aligned/reset state;
- reduced-motion behavior.

It has no routing, content-registry, storage, network, or product-data responsibilities.

Geometry and snap calculations live in small pure helpers so they can be tested without a
DOM-specific test framework.

### Root Error Boundary

The root route exports an `ErrorBoundary` that classifies route errors:

- route error response with status `404` renders `NotFoundPage` inside `SiteShell`;
- unmatched URLs use the same 404 branch;
- non-404 route responses and unexpected exceptions render a separate calm generic error view.

Product route publication guards remain unchanged. Their existing thrown `404` responses flow into
the shared boundary, so draft and fixture products never become publicly visible.

### Root Hydration Fallback

The root route also exports `HydrateFallback`. It renders the initial, non-interactive
`NotFoundPage` inside `SiteShell`. React Router writes this root-only fallback into the SPA fallback
HTML at build time, so the generated `404.html` contains the error explanation and navigation links
before client hydration. After hydration, an unknown location resolves to the root 404 boundary and
the same page gains its optional interaction.

All supported public routes remain prerendered, so this missing-page hydration fallback is not used
as the loading UI for normal published content.

## Static Hosting And Build Flow

The existing React Router configuration has `ssr: false` and prerenders `/`. In this configuration,
React Router emits `build/client/__spa-fallback.html` for routes that were not prerendered.

The production build will add an explicit post-build step that copies that generated fallback,
including the root `HydrateFallback` markup, to `build/client/404.html`. GitHub Pages uses this root
file for unknown paths while retaining the missing-path URL. Client routing then classifies the
unmatched location and renders the root 404 boundary.

The post-build step must:

1. fail clearly if `build/client/__spa-fallback.html` is absent;
2. copy bytes without hand-editing generated asset references;
3. run after `react-router build`;
4. leave `public/CNAME` and `public/app-ads.txt` untouched.

`scripts/check-routes.ts` must require `build/client/404.html` in addition to the current route and
root-file checks.

## Metadata And Indexing

- page title: `404 - Page not found | Keyflare Studio`;
- robots directive: `noindex, follow`;
- the 404 page is excluded from `sitemap.xml`;
- canonical metadata must not point an arbitrary missing URL back to itself;
- unexpected non-404 errors use their own generic metadata and copy.

The actual HTTP `404` status for unknown production paths is supplied by GitHub Pages when it serves
the custom `404.html`.

## Error Handling And Fallbacks

- Missing generated SPA fallback: production build fails instead of silently omitting `404.html`.
- Missing pointer APIs or JavaScript failure: static message and links remain functional.
- Reduced motion: static poster treatment, with no interaction initialization.
- Unexpected application error: generic error view, not the playful missing-page copy.
- Published-route regressions: existing `findPublishedProduct()` guards remain authoritative.

## Testing And Verification

Focused Vitest coverage will verify:

- 404 versus non-404 error classification;
- pure layer-boundary and snap-threshold calculations;
- aligned-state reset behavior where represented in pure state helpers;
- draft and fixture product routes still produce `404`;
- the fallback-copy script fails when its source is absent and creates the expected destination when
  present.

Build verification will verify:

- `build/client/404.html` exists;
- `build/client/CNAME` and `build/client/app-ads.txt` still exist;
- all existing prerendered route outputs still exist;
- sitemap and robots generation remain valid.

Manual responsive verification will cover:

- desktop pointer parallax and dragging;
- touch dragging;
- narrow mobile layout;
- keyboard navigation;
- reduced-motion rendering;
- direct navigation to a nonexistent production-like URL.

The release gate is the repository-standard:

```bash
npm run check
```

## Documentation Impact

After implementation and verification:

- add the static custom-404 build/output rule to `.ai/SITE.md`;
- add the approved 404 visual treatment to `.ai/DESIGN.md`;
- remove this temporary design and its implementation plan from `docs/superpowers/` once the feature
  is complete and the durable guidance has been migrated.

## References

- React Router prerendering and SPA fallback:
  <https://reactrouter.com/how-to/pre-rendering>
- React Router route-module error boundary:
  <https://reactrouter.com/start/framework/route-module#errorboundary>
- GitHub Pages custom 404 pages:
  <https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site>
