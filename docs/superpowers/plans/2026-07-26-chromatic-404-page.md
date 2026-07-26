# Chromatic 404 Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship a static, accessible, interactive Chromatic Poster 404 page for all missing
Keyflare Studio URLs.

**Architecture:** A shared `NotFoundPage` renders from the root React Router `ErrorBoundary` and
root `HydrateFallback`. A focused `Chromatic404Artwork` owns pointer/touch interaction while pure
geometry helpers keep motion testable. The production build copies React Router's generated
`__spa-fallback.html` to the GitHub Pages-required root `404.html`.

**Tech Stack:** React 19, React Router framework mode, TypeScript, CSS Modules, Vitest, Node
filesystem APIs, GitHub Pages.

---

## File Structure

- Create `app/components/Chromatic404Artwork.logic.ts` for offsets, bounds, ambient motion, and snap
  calculations.
- Create `app/components/Chromatic404Artwork.tsx` for pointer/touch state and accessible artwork
  markup.
- Create `app/components/Chromatic404Artwork.module.css` for the layered poster illustration and
  motion states.
- Create `app/components/NotFoundPage.tsx` for semantic content, metadata, links, aligned copy, and
  reset coordination.
- Create `app/components/NotFoundPage.module.css` for responsive page composition.
- Create `app/components/GenericErrorPage.tsx` for non-404 root failures.
- Create `app/rootError.ts` for pure root-error classification.
- Create `scripts/generate-404-page.ts` for copying the generated SPA fallback.
- Create `tests/ui/chromatic-404.test.tsx` for geometry, error classification, and SSR markup.
- Create `tests/scripts/generate-404-page.test.ts` for fallback-copy behavior.
- Modify `app/root.tsx` to export `ErrorBoundary` and `HydrateFallback`.
- Modify `package.json` to run the 404 generation after `react-router build`.
- Modify `scripts/check-routes.ts` to require `build/client/404.html`.
- Modify `.ai/SITE.md` and `.ai/DESIGN.md` with durable 404 rules.
- Remove the temporary design and plan files after all implementation and release checks pass.

### Task 1: Test And Implement Artwork Geometry

**Files:**

- Create: `tests/ui/chromatic-404.test.tsx`
- Create: `app/components/Chromatic404Artwork.logic.ts`

- [ ] **Step 1: Write failing geometry tests**

Add tests that define the initial offsets, clamp behavior, ambient mapping, and snap threshold:

```ts
import { describe, expect, test } from "vitest";
import {
  INITIAL_PLATE_OFFSETS,
  arePlatesAligned,
  clampPlateOffset,
  getAmbientOffsets,
} from "../../app/components/Chromatic404Artwork.logic";

describe("chromatic 404 artwork geometry", () => {
  test("starts visibly out of register", () => {
    expect(INITIAL_PLATE_OFFSETS.red).toEqual({ x: -24, y: -9 });
    expect(INITIAL_PLATE_OFFSETS.amber).toEqual({ x: 20, y: 11 });
    expect(INITIAL_PLATE_OFFSETS.blue).toEqual({ x: 0, y: 0 });
    expect(arePlatesAligned(INITIAL_PLATE_OFFSETS)).toBe(false);
  });

  test("clamps dragged plates inside the artwork", () => {
    expect(clampPlateOffset({ x: 99, y: -80 })).toEqual({ x: 48, y: -48 });
  });

  test("maps pointer position to small opposing ambient offsets", () => {
    expect(getAmbientOffsets(1, -1)).toEqual({
      red: { x: -8, y: 8 },
      amber: { x: 6, y: -6 },
      blue: { x: -2, y: 2 },
    });
  });

  test("snaps only when every plate is close to registration", () => {
    expect(
      arePlatesAligned({
        red: { x: 5, y: 4 },
        amber: { x: -3, y: 6 },
        blue: { x: 0, y: 0 },
      }),
    ).toBe(true);
    expect(
      arePlatesAligned({
        red: { x: 10, y: 0 },
        amber: { x: 0, y: 0 },
        blue: { x: 0, y: 0 },
      }),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the geometry tests and confirm the import fails**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
```

Expected: FAIL because `Chromatic404Artwork.logic.ts` does not exist.

- [ ] **Step 3: Implement the pure geometry helpers**

Create:

```ts
export type PlateName = "red" | "amber" | "blue";
export type Point = { x: number; y: number };
export type PlateOffsets = Record<PlateName, Point>;

export const INITIAL_PLATE_OFFSETS: PlateOffsets = {
  red: { x: -24, y: -9 },
  amber: { x: 20, y: 11 },
  blue: { x: 0, y: 0 },
};

const dragLimit = 48;
const snapDistance = 9;

export function clampPlateOffset(point: Point): Point {
  return {
    x: Math.max(-dragLimit, Math.min(dragLimit, point.x)),
    y: Math.max(-dragLimit, Math.min(dragLimit, point.y)),
  };
}

export function getAmbientOffsets(normalizedX: number, normalizedY: number): PlateOffsets {
  return {
    red: { x: normalizedX * -8, y: normalizedY * -8 },
    amber: { x: normalizedX * 6, y: normalizedY * 6 },
    blue: { x: normalizedX * -2, y: normalizedY * -2 },
  };
}

export function arePlatesAligned(offsets: PlateOffsets): boolean {
  return Object.values(offsets).every(({ x, y }) => Math.hypot(x, y) < snapDistance);
}
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the geometry**

```bash
git add app/components/Chromatic404Artwork.logic.ts tests/ui/chromatic-404.test.tsx
git commit -m "Add chromatic 404 interaction geometry"
```

### Task 2: Build The Accessible Artwork And Page

**Files:**

- Modify: `tests/ui/chromatic-404.test.tsx`
- Create: `app/components/Chromatic404Artwork.tsx`
- Create: `app/components/Chromatic404Artwork.module.css`
- Create: `app/components/NotFoundPage.tsx`
- Create: `app/components/NotFoundPage.module.css`

- [ ] **Step 1: Add failing SSR markup tests**

Append:

```tsx
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { NotFoundPage } from "../../app/components/NotFoundPage";

test("renders useful 404 content and exits before hydration", () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(NotFoundPage)));

  expect(html).toContain("ERROR EDITION / 404");
  expect(html).toContain("This page slipped out of register.");
  expect(html).toContain("The address is real. The page isn&#x27;t.");
  expect(html).toContain('href="/"');
  expect(html).toContain('href="/products/"');
  expect(html).toContain("noindex, follow");
  expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(3);
  expect(html).toContain('aria-live="polite"');
});
```

- [ ] **Step 2: Run the focused test and confirm the page import fails**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
```

Expected: FAIL because `NotFoundPage.tsx` does not exist.

- [ ] **Step 3: Implement the artwork component**

Implement a `forwardRef` component with this public interface:

```tsx
export type Chromatic404ArtworkHandle = {
  reset(): void;
};

type Chromatic404ArtworkProps = {
  onAlignmentChange(aligned: boolean): void;
};
```

The component must:

- initialize plate offsets from `INITIAL_PLATE_OFFSETS`;
- map pointer position to `getAmbientOffsets()` only while no plate is actively dragged;
- use `setPointerCapture()` and `releasePointerCapture()` for a selected plate;
- clamp drag positions with `clampPlateOffset()`;
- set all offsets to `{ x: 0, y: 0 }` and call `onAlignmentChange(true)` when
  `arePlatesAligned()` becomes true;
- expose `reset()` through `useImperativeHandle`;
- disable motion and pointer handlers when `matchMedia("(prefers-reduced-motion: reduce)")` matches;
- render one semantic `404` and three decorative layer spans with `aria-hidden="true"`;
- attach `touch-action: none` only to the artwork stage.

Use CSS custom properties for plate and ambient offsets:

```tsx
style={
  {
    "--plate-x": `${offsets[name].x}px`,
    "--plate-y": `${offsets[name].y}px`,
    "--ambient-x": `${ambient[name].x}px`,
    "--ambient-y": `${ambient[name].y}px`,
  } as React.CSSProperties
}
```

- [ ] **Step 4: Implement the page component**

`NotFoundPage` holds `aligned` state, a ref to the artwork handle, and renders:

```tsx
<>
  <title>404 - Page not found | Keyflare Studio</title>
  <meta name="robots" content="noindex, follow" />
  <section aria-labelledby="not-found-title">
    <p>ERROR EDITION / 404</p>
    <Chromatic404Artwork ref={artworkRef} onAlignmentChange={setAligned} />
    <div aria-live="polite">
      <h1 id="not-found-title">
        {aligned ? "Beautifully wrong." : "This page slipped out of register."}
      </h1>
      <p>
        {aligned
          ? "The page is still missing. The way home isn't."
          : "The address is real. The page isn't."}
      </p>
    </div>
    <div>
      <PosterButton to="/" size="hero" tone="primary">
        Return home
      </PosterButton>
      {aligned ? (
        <button type="button" onClick={() => artworkRef.current?.reset()}>
          Play again
        </button>
      ) : (
        <PosterButton to="/products/" size="hero">
          View products
        </PosterButton>
      )}
    </div>
  </section>
</>
```

Style the native `Play again` button with the same poster geometry as `PosterButton` while retaining
native button semantics.

- [ ] **Step 5: Create the complete CSS Modules**

`NotFoundPage.module.css` must provide:

- a two-column poster composition at desktop sizes;
- a constrained copy column and wide artwork column;
- an `ERROR EDITION / 404` label with red fill and hard border;
- a wrapped actions row with no nested cards;
- one-column composition below `860px`;
- mobile sizes bounded with `clamp()` and no viewport-width-only typography.

`Chromatic404Artwork.module.css` must provide:

- warm paper grid and `2px` ink frame;
- minimum desktop height near `26rem`, reduced on mobile;
- Syne `404` layers centered in the stage;
- layer transforms using `calc(var(--plate-x) + var(--ambient-x))`;
- red, amber, and blue fills with multiply blending;
- registration corners, ruler marks, drag hint, and chromatic success band;
- hard poster shadow and maximum `8px` radius;
- `cursor: grab`/`grabbing`;
- `@media (prefers-reduced-motion: reduce)` rules that remove transitions and hide interaction hints.

- [ ] **Step 6: Run focused tests, typecheck, and lint**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the page**

```bash
git add app/components/Chromatic404Artwork* app/components/NotFoundPage* tests/ui/chromatic-404.test.tsx
git commit -m "Build interactive chromatic 404 page"
```

### Task 3: Integrate Root 404 And Generic Error Handling

**Files:**

- Modify: `tests/ui/chromatic-404.test.tsx`
- Create: `app/rootError.ts`
- Create: `app/components/GenericErrorPage.tsx`
- Modify: `app/root.tsx`

- [ ] **Step 1: Add failing error-classification tests**

Add:

```ts
import { getRootErrorKind } from "../../app/rootError";

test("classifies 404 route responses separately from unexpected errors", () => {
  expect(
    getRootErrorKind({
      status: 404,
      statusText: "Not Found",
      internal: true,
      data: "No route matches URL",
    }),
  ).toBe("not-found");
  expect(
    getRootErrorKind({
      status: 500,
      statusText: "Server Error",
      internal: false,
      data: "Broken",
    }),
  ).toBe("error");
  expect(getRootErrorKind(new Error("Broken"))).toBe("error");
});
```

- [ ] **Step 2: Run the test and confirm the classifier import fails**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
```

Expected: FAIL because `app/rootError.ts` does not exist.

- [ ] **Step 3: Implement root error classification**

Create:

```ts
import { isRouteErrorResponse } from "react-router";

export function getRootErrorKind(error: unknown): "not-found" | "error" {
  if (error instanceof Response) {
    return error.status === 404 ? "not-found" : "error";
  }

  return isRouteErrorResponse(error) && error.status === 404 ? "not-found" : "error";
}
```

- [ ] **Step 4: Add root boundary and hydration fallback**

In `app/root.tsx`:

```tsx
export function HydrateFallback() {
  return (
    <SiteShell>
      <NotFoundPage />
    </SiteShell>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <SiteShell>
      {getRootErrorKind(error) === "not-found" ? <NotFoundPage /> : <GenericErrorPage />}
    </SiteShell>
  );
}
```

`GenericErrorPage` renders a calm document-like `Something went wrong` heading, a short explanation,
and a `Return home` link. It uses `noindex, follow` and must not display stack traces in production.

- [ ] **Step 5: Add SSR tests for root exports**

Verify that:

- `HydrateFallback` statically renders the Keyflare shell and missing-page content;
- `ErrorBoundary` with a route-like 404 renders `This page slipped out of register.`;
- `ErrorBoundary` with `new Error()` renders `Something went wrong` and not the 404 copy.

- [ ] **Step 6: Run focused tests, typecheck, and lint**

Run:

```bash
npx vitest run tests/ui/chromatic-404.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit root integration**

```bash
git add app/root.tsx app/rootError.ts app/components/GenericErrorPage.tsx tests/ui/chromatic-404.test.tsx
git commit -m "Route missing pages through the root boundary"
```

### Task 4: Generate GitHub Pages 404 Output

**Files:**

- Create: `tests/scripts/generate-404-page.test.ts`
- Create: `scripts/generate-404-page.ts`
- Modify: `package.json`
- Modify: `scripts/check-routes.ts`

- [ ] **Step 1: Write failing fallback-copy tests**

Create tests using `mkdtemp`, `writeFile`, `readFile`, and `rm`:

```ts
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generate404Page } from "../../scripts/generate-404-page";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generate404Page", () => {
  test("copies the React Router SPA fallback byte-for-byte", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-404-"));
    tempDirs.push(dir);
    const source = join(dir, "__spa-fallback.html");
    const destination = join(dir, "404.html");
    await writeFile(source, "<html><body>fallback</body></html>");

    await generate404Page(source, destination);

    expect(await readFile(destination, "utf8")).toBe("<html><body>fallback</body></html>");
  });

  test("fails when React Router did not emit the fallback", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-404-"));
    tempDirs.push(dir);

    await expect(
      generate404Page(join(dir, "__spa-fallback.html"), join(dir, "404.html")),
    ).rejects.toThrow(/Missing React Router SPA fallback/);
  });
});
```

- [ ] **Step 2: Run the script tests and confirm the import fails**

Run:

```bash
npx vitest run tests/scripts/generate-404-page.test.ts
```

Expected: FAIL because `scripts/generate-404-page.ts` does not exist.

- [ ] **Step 3: Implement the generator**

Create:

```ts
import { copyFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function generate404Page(source: string, destination: string) {
  try {
    await copyFile(source, destination);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Missing React Router SPA fallback: ${source}`, { cause: error });
    }
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await generate404Page("build/client/__spa-fallback.html", "build/client/404.html");
  console.log("Generated build/client/404.html.");
}
```

- [ ] **Step 4: Wire the build and route-output check**

Change the build script to:

```json
"build": "npm run validate:content && npm run generate:static && react-router build && tsx scripts/generate-404-page.ts"
```

Add `"build/client/404.html"` to `requiredFiles` in `scripts/check-routes.ts`.

- [ ] **Step 5: Run script tests and production build**

Run:

```bash
npx vitest run tests/scripts/generate-404-page.test.ts
npm run build
npm run check:routes
```

Expected:

- script tests PASS;
- build logs `Generated build/client/404.html.`;
- route output check passes.

- [ ] **Step 6: Inspect generated 404 metadata and content**

Run:

```bash
test -f build/client/404.html
rg -n "This page slipped out of register|noindex, follow|Return home" build/client/404.html
cmp build/client/__spa-fallback.html build/client/404.html
```

Expected: all commands exit 0 and the generated file contains the static missing-page content.

- [ ] **Step 7: Commit build integration**

```bash
git add scripts/generate-404-page.ts scripts/check-routes.ts package.json tests/scripts/generate-404-page.test.ts
git commit -m "Generate the GitHub Pages 404 fallback"
```

### Task 5: Record Durable Site And Design Rules

**Files:**

- Modify: `.ai/SITE.md`
- Modify: `.ai/DESIGN.md`

- [ ] **Step 1: Add static-hosting guidance**

Document in `.ai/SITE.md` that:

- unknown GitHub Pages paths are served from root `404.html`;
- `404.html` is generated from React Router's `__spa-fallback.html`;
- the root `HydrateFallback` must contain useful missing-page content;
- `scripts/check-routes.ts` must require the file;
- 404 remains excluded from prerender paths and sitemap output.

- [ ] **Step 2: Add visual guidance**

Document in `.ai/DESIGN.md` that the studio-level 404 uses the Chromatic Poster calibration
metaphor, optional interaction, immediate navigation exits, reduced-motion fallback, and the normal
site shell.

- [ ] **Step 3: Run formatting and focused tests**

Run:

```bash
npx prettier --check .ai/SITE.md .ai/DESIGN.md
npx vitest run tests/ui/chromatic-404.test.tsx tests/scripts/generate-404-page.test.ts
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit durable guidance**

```bash
git add .ai/SITE.md .ai/DESIGN.md
git commit -m "Document custom 404 site rules"
```

### Task 6: Visual QA, Release Gate, And Temporary-Doc Cleanup

**Files:**

- Delete: `docs/superpowers/specs/2026-07-26-chromatic-404-page-design.md`
- Delete: `docs/superpowers/plans/2026-07-26-chromatic-404-page.md`

- [ ] **Step 1: Start production-like preview**

Run:

```bash
npm run preview -- --listen tcp://127.0.0.1:4173
```

Open:

- `http://127.0.0.1:4173/404.html`;
- a nonexistent URL served through the generated fallback in a local static-host simulation.

- [ ] **Step 2: Perform visual and input QA**

Verify:

- desktop layout matches the approved Chromatic Poster composition;
- colour layers respond within their bounded range;
- direct drag works and snapping changes copy;
- `Play again` restores initial offsets;
- Home and Products work without solving;
- mobile layout has no horizontal overflow;
- touch uses one pointer;
- keyboard focus reaches the normal exits;
- reduced motion shows a static poster without parallax or snap animation;
- generic non-404 error output is calm and distinct.

- [ ] **Step 3: Run the full release gate**

Run:

```bash
npm run check
```

Expected: content validation, typecheck, lint, formatting, all tests, build, and route checks pass.

- [ ] **Step 4: Remove temporary planning documents**

After `.ai/SITE.md` and `.ai/DESIGN.md` contain the durable decisions and the release gate passes,
delete the temporary design and plan as required by `AGENTS.md`.

- [ ] **Step 5: Re-run the release gate after cleanup**

Run:

```bash
npm run check
```

Expected: all checks pass with no references to deleted temporary documents.

- [ ] **Step 6: Commit verified cleanup**

```bash
git add -A docs/superpowers
git commit -m "Remove completed 404 planning docs"
```

- [ ] **Step 7: Inspect final branch state**

Run:

```bash
git status --short --branch
git log --oneline --decorate origin/main..HEAD
```

Expected: clean `codex/chromatic-404-page` worktree and a focused implementation commit series.
