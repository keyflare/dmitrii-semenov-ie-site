# Ratebench Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Ratebench immediately identifiable, give its product pages a strict technical
background, accurately illustrate route-level rate comparison, and improve product-grid responsive
behavior.

**Architecture:** Add a static `ProductPageFrame` driven by optional product theme metadata and wrap
every public product route with it. Keep Ratebench's detailed visual composition inside its custom
overview component. Adjust shared catalog/card breakpoints and home-grid spacing without changing
the registry publication model.

**Tech Stack:** React 19, React Router 7 static prerendering, TypeScript, CSS Modules, Vitest.

---

### Task 1: Add product page-surface metadata and frame

**Files:**
- Create: `app/components/ProductPageFrame.tsx`
- Create: `app/components/ProductPageFrame.module.css`
- Modify: `app/content/products/types.ts`
- Modify: `app/content/products/registry.ts`
- Modify: `app/content/products/validate.ts`
- Modify: `app/routes/product-overview.tsx`
- Modify: `app/routes/product-privacy.tsx`
- Modify: `app/routes/product-terms.tsx`
- Modify: `app/routes/product-support.tsx`
- Modify: `app/routes/product-data-deletion.tsx`
- Test: `tests/content/ratebench-product.test.tsx`
- Test: `tests/content/validate-products.test.ts`

- [ ] **Step 1: Write failing frame and metadata tests**

Assert that Ratebench has `theme.pageSurface: "ledger"`, rendered Ratebench product content contains
`data-page-surface="ledger"`, and invalid runtime page-surface values fail content validation.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx tests/content/validate-products.test.ts
```

Expected: failures for missing `pageSurface`, frame markup, and validation.

- [ ] **Step 3: Implement the typed frame**

Add `ProductPageSurface = "ledger"` and optional `pageSurface` theme metadata. Build a frame with:

```tsx
<div className={styles.frame} data-page-surface={product.theme?.pageSurface}>
  {children}
</div>
```

Its `ledger` pseudo-element spans `100vw`, begins above the route content, and uses a cold technical
grid. Wrap overview, Privacy, Terms, Support, and Data Deletion product content.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused Vitest command and expect all tests to pass.

- [ ] **Step 5: Commit**

```bash
git add app/components app/content/products app/routes tests/content
git commit -m "Add product-specific page surfaces"
```

### Task 2: Rebuild the Ratebench hero and benchmark

**Files:**
- Modify: `app/content/products/ratebench/Overview.tsx`
- Modify: `app/content/products/ratebench/Overview.module.css`
- Test: `tests/content/ratebench-product.test.tsx`

- [ ] **Step 1: Write failing semantic tests**

Require a visible H1 containing `Ratebench`, the supporting phrase `Compare every step.`, route
`USD → EUR → USDT`, both `Market` and `Effective` column labels, two operation rows, and a `Whole
route` summary. Reject the old `Sent` and `Effective result` labels.

- [ ] **Step 2: Run the Ratebench test and verify RED**

```bash
npm test -- tests/content/ratebench-product.test.tsx
```

- [ ] **Step 3: Implement the new hero and benchmark**

Make `Ratebench` the H1, move the tagline into a supporting element, enlarge the logo, and replace
the old ledger array with structured rows:

```ts
[
  { step: "01", pair: "USD / EUR", market: "0.920", effective: "0.900" },
  { step: "02", pair: "EUR / USDT", market: "1.080", effective: "1.050" },
]
```

Render a final `Whole route · USD / USDT` row with `0.994` and `0.945`.

- [ ] **Step 4: Run the Ratebench test and verify GREEN**

Run the same focused command and expect all tests to pass.

- [ ] **Step 5: Commit**

```bash
git add app/content/products/ratebench tests/content/ratebench-product.test.tsx
git commit -m "Refine Ratebench hero and benchmark"
```

### Task 3: Redraw the financial disclaimer

**Files:**
- Modify: `app/content/products/ratebench/Overview.tsx`
- Modify: `app/content/products/ratebench/Overview.module.css`
- Test: `tests/content/ratebench-product.test.tsx`

- [ ] **Step 1: Write a failing structure test**

Require `Important`, `Reference only`, and `Reference, not advice` inside the disclaimer and assert
the CSS no longer uses the asymmetric `grid-template-columns: minmax(6rem, 0.28fr)`.

- [ ] **Step 2: Run the Ratebench test and verify RED**

```bash
npm test -- tests/content/ratebench-product.test.tsx
```

- [ ] **Step 3: Implement the dark single-column callout**

Use an equal-padding dark card with a compact flex header and a one-column body. Keep the factual
disclaimer wording and blue accent.

- [ ] **Step 4: Run the Ratebench test and verify GREEN**

- [ ] **Step 5: Commit**

```bash
git add app/content/products/ratebench tests/content/ratebench-product.test.tsx
git commit -m "Redraw Ratebench financial disclaimer"
```

### Task 4: Improve Products and Launch board responsiveness

**Files:**
- Modify: `app/styles/global.css`
- Modify: `app/components/ProductCard.module.css`
- Test: `tests/ui/visual-components.test.tsx`

- [ ] **Step 1: Write failing CSS regression tests**

Require:

```css
.home-products-grid { gap: var(--space-6); }
@media (max-width: 1050px) { .catalog-grid { grid-template-columns: 1fr; } }
@media (max-width: 860px) { .card { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Run visual component tests and verify RED**

```bash
npm test -- tests/ui/visual-components.test.tsx
```

- [ ] **Step 3: Implement the responsive CSS**

Add the home gap, the earlier catalog stack breakpoint, and move the internal card breakpoint from
`720px` to `860px`.

- [ ] **Step 4: Run visual component tests and verify GREEN**

- [ ] **Step 5: Commit**

```bash
git add app/styles/global.css app/components/ProductCard.module.css tests/ui/visual-components.test.tsx
git commit -m "Improve product grid responsiveness"
```

### Task 5: Document and verify

**Files:**
- Modify: `.ai/DESIGN.md`
- Delete: `docs/superpowers/specs/2026-07-26-ratebench-visual-refinement-design.md`
- Delete: `docs/superpowers/plans/2026-07-26-ratebench-visual-refinement.md`

- [ ] **Step 1: Document page-surface presets**

Explain that product metadata may opt into a static full-bleed background preset while preserving
the global studio header/footer and static route model.

- [ ] **Step 2: Run the full release gate**

```bash
npm run check
```

Expected: validation, typecheck, lint, formatting, tests, build, and route checks all pass.

- [ ] **Step 3: Run browser QA**

Inspect Ratebench overview and documents, Products, and Home at `1280px`, `900px`, and `390px`.
Confirm no horizontal overflow, one visible Ratebench H1, compact readable benchmark rows, clean
disclaimer alignment, one-column catalog at intermediate width, Launch board gaps, and no browser
errors.

- [ ] **Step 4: Remove temporary docs and commit**

```bash
git add .ai/DESIGN.md docs/superpowers
git commit -m "Document product page surfaces"
```

