# Palette Master iOS Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Palette Master iOS placeholder with the published App Store link.

**Architecture:** Keep `app/content/products/registry.ts` as the source of truth for store URLs. Shared product cards will pick up the new iOS link automatically, while the custom Palette Master overview will read both store URLs from the product and render two equivalent external store actions.

**Tech Stack:** React 19, TypeScript, React Router, CSS Modules, Vitest

---

### Task 1: Describe released iOS availability in focused tests

**Files:**
- Modify: `tests/content/product-customization.test.ts:76-159`
- Modify: `tests/ui/visual-components.test.tsx:218-240`

- [ ] **Step 1: Update the registry expectation**

Rename the Palette Master availability test and add the exact iOS URL to its existing
`toMatchObject` expectation:

```diff
- test("Palette Master is published with Android availability and iOS coming soon", () => {
+ test("Palette Master is published with Android and iOS availability", () => {
    const paletteMaster = products.find((product) => product.slug === "palette-master");

    expect(paletteMaster).toMatchObject({
      status: "published",
      type: "mobile-game",
      platforms: ["android", "ios"],
      supportEmail: "support@keyflare.studio",
      storeLinks: {
        android: "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&hl=en",
+       ios: "https://apps.apple.com/app/id6785084110",
      },
```

Keep the existing `privacyProfile` fields and published-product assertion that follow this block
unchanged.
```

- [ ] **Step 2: Update the custom overview expectations**

Require the App Store link and remove the old coming-soon assertions:

```ts
expect(html).toContain("https://apps.apple.com/app/id6785084110");
expect(html).toContain("iOS · App Store");
expect(html).not.toContain("Coming soon");
expect(html).not.toContain("iOS Coming Soon");
```

- [ ] **Step 3: Update the shared Palette Master card expectations**

```ts
expect(html).toContain("https://apps.apple.com/app/id6785084110");
expect(html).not.toContain("iOS coming soon");
```

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx
```

Expected: FAIL because the registry does not expose `storeLinks.ios`, the custom overview has no App Store `href`, and both views still render iOS coming-soon copy.

### Task 2: Publish the App Store link

**Files:**
- Modify: `app/content/products/registry.ts:41-45`
- Modify: `app/content/products/palette-master/Overview.tsx:6-9,51-69,156-217`
- Modify: `app/content/products/palette-master/Overview.module.css:255-268`

- [ ] **Step 1: Add the iOS URL to the product registry**

```ts
storeLinks: {
  android: "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&hl=en",
  ios: "https://apps.apple.com/app/id6785084110",
},
```

- [ ] **Step 2: Read store URLs from the product in the custom overview**

Remove the module-level `playStoreUrl` constant and add these bindings inside `PaletteMasterOverview`:

```ts
const playStoreUrl = product.storeLinks.android;
const appStoreUrl = product.storeLinks.ios;
```

- [ ] **Step 3: Render released iOS status and an external App Store action**

Replace the hero status with:

```tsx
<strong>iOS</strong>
```

Replace the iOS placeholder card with:

```tsx
<a className={styles.platformCard} href={appStoreUrl} rel="noreferrer" target="_blank">
  <img
    className={styles.storeLogo}
    src="/products/palette-master/store-icons/app-store.svg"
    alt="App Store logo"
    loading="lazy"
  />
  <span className={styles.platformCopy}>
    <span>Available now</span>
    <strong>iOS · App Store</strong>
  </span>
</a>
```

- [ ] **Step 4: Remove the unused placeholder styling**

Delete the `.comingSoonCard` and `.comingSoonCard:hover` rules because no Palette Master element uses them after release.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npm test -- tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx
```

Expected: both test files PASS.

### Task 3: Verify and clean up temporary planning files

**Files:**
- Delete: `docs/superpowers/specs/2026-08-27-palette-master-ios-release-design.md`
- Delete: `docs/superpowers/plans/2026-08-27-palette-master-ios-release.md`

- [ ] **Step 1: Run the UI-change release checks**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

Expected: all commands exit with status 0.

- [ ] **Step 2: Check the final diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only the intended product registry, Palette Master overview, CSS, and focused test changes remain after temporary specs/plans are removed.

- [ ] **Step 3: Commit the implementation**

```bash
git add app/content/products/registry.ts app/content/products/palette-master/Overview.tsx app/content/products/palette-master/Overview.module.css tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx docs/superpowers/specs/2026-08-27-palette-master-ios-release-design.md docs/superpowers/plans/2026-08-27-palette-master-ios-release.md
git commit -m "Publish Palette Master App Store link"
```
