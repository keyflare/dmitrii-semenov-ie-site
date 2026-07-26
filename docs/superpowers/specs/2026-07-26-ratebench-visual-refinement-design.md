# Ratebench Visual Refinement Design

## Goal

Make Ratebench immediately identifiable, visually distinct from the studio's playful pages, and
truthful to the application's route-based market/effective-rate comparison model. Improve product
grid behavior at intermediate widths and restore spacing between Launch board cards.

## Product page background

Add a reusable `ProductPageFrame` around every public product page. Product theme metadata may opt
into a named page-surface preset. Ratebench uses the `ledger` preset: a cold gray-blue full-bleed
background with a restrained technical grid and subtle blue focus glow. The global site header and
footer remain unchanged so the page still belongs to Keyflare Studio.

The frame is static, route-safe, and driven by product metadata. It does not mutate `body`, depend
on client effects, or introduce runtime routing behavior. Products without a page-surface preset
retain the existing site background.

## Ratebench hero

- The visible H1 is `Ratebench`.
- The existing Syne display font remains the primary brand typeface.
- `Compare every step.` becomes a smaller supporting statement.
- The real Ratebench logo grows to a prominent 4–5rem mark while remaining responsive.
- Android/iOS and In development remain visible without implying store availability.
- Existing feedback, Privacy, Terms, and Support links remain.

## Exchange benchmark

Replace the generic sent/step/result rows with a compact route comparison:

- route: `USD → EUR → USDT`;
- columns: `Market` and `Effective`;
- step 01 `USD / EUR`: market `0.920`, effective `0.900`;
- step 02 `EUR / USDT`: market `1.080`, effective `1.050`;
- whole route `USD / USDT`: market `0.994`, effective `0.945`.

The values are illustrative and internally coherent: each whole-route rate approximately equals the
product of its two step rates. The table stays compact and includes a non-live-data note.

## Disclaimer

Replace the asymmetric two-column disclaimer with one dark, self-contained callout:

- a compact top line with `Important` and `Reference only`;
- the existing `Reference, not advice` heading;
- the existing factual financial disclaimer;
- equal horizontal padding and no empty label column.

## Responsive product grids

- Products catalog uses two columns only when there is enough room for complete cards; it switches
  to one column at `1050px`.
- Product card internal media layout switches to one column at `860px`.
- Home Launch board keeps its current single-column presentation but adds an explicit card gap.

## Testing and verification

- Extend Ratebench rendering tests for the visible product name and revised benchmark semantics.
- Add tests for the reusable product page frame and Ratebench `ledger` surface metadata.
- Add CSS regression assertions for earlier catalog/card breakpoints and Launch board gap.
- Run the focused tests red/green, then the full `npm run check`.
- Visually inspect Ratebench overview and documents plus Products and Home at wide, intermediate,
  and mobile widths, with horizontal-overflow and browser-error checks.
