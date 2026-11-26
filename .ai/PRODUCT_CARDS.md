# Studio Product Cards

These rules apply to the shared `ProductCard` on the homepage and `/products/`. They do not
change the design or navigation of project-owned websites such as Ratebench and WG Portal.

## Source Of Truth

Add products to `app/content/products/registry.ts`. The card is derived by
`app/content/products/card.ts`; neither route may maintain its own card labels, release flags,
store-button arrays or product-specific exceptions.

Use the existing metadata:

- `type` supplies the game/app category. `mobile-game` maps to GAME; `mobile-app`, `desktop-app`,
  `tool` and `software` map to APP. These legacy registry classifications remain available to
  product-page templates and placeholder artwork, but are never printed verbatim on the card.
- `platforms` lists **all planned platforms**, including platforms that have not launched yet.
- `storeLinks[platform]` contains a real published download/store URL for that platform. Omit it
  while that release is unavailable. Do not use placeholder URLs, store homepages or `#`.
- `releaseStage: "in-development"` is reserved for a product with no available releases. Existing
  validation rejects store links alongside that flag. Remove the flag when the first platform
  launches; individual missing links continue to produce the development banner automatically.
- `status` controls publication of the website entry, not release of the application. A product
  may be `published` on the studio website while all its store releases are still coming soon.
- Optional `cardMedia` selects product imagery approved for that particular product. It does not
  affect platform releases. Without approved media, retain the existing decorative placeholder.
- `cardIcon` selects the app icon displayed in the heading. Use the app's native iOS asset for
  mobile products and preserve the 5:3 aspect ratio of tvOS icons.

The studio still renders only `getPublishedProducts()`. Draft and fixture products must stay out
of both public card grids and their public routes.

## Anatomy

Each card contains, in this order:

1. The computed uppercase type label.
2. The product name with its app icon, followed by the existing description.
3. An optional `In development` banner.
4. A bottom rail containing download/store actions only.

Do not repeat a standalone Android/iOS/platform list below the description. Do not put feedback,
Privacy, Terms, Support or Data deletion controls in the card's bottom rail. Those documents and
contacts remain reachable on the product's own overview and document pages. The card itself
continues to link to `/products/:slug/`; store actions are separate keyboard targets, never nested
inside the overview link.

## Product Imagery

Choose media separately for every product; mobile platform support does not automatically mean
that a card must use a phone screenshot. Do not replace authentic UI with generated or recreated
app screens. Copy selected source assets into the studio's own `public/media/cards/` directory so
the catalog does not depend on files inside imported product exports or sibling checkouts at runtime.

An approved iPhone screenshot uses the framed treatment:

```ts
cardMedia: {
  kind: "iphone",
  src: "/media/cards/palette-master-gameplay.png",
  alt: "Palette Master gameplay showing a scrambled color grid.",
  width: 1320,
  height: 2868,
},
```

Use intrinsic dimensions and a meaningful image description. Local PNG, WebP and AVIF paths are
supported. Load approved images locally with lazy loading and asynchronous decoding.

The heading icon comes from the corresponding native app project. Set `cardIcon.src`, `width` and
`height` to describe the local export. Its accessible name comes from the adjacent heading text.
Palette Master uses `AppIcon.appiconset/IconLogo.png`, Ratebench uses the dark Xcode rendition of
`Ratebench.icon`, and WG Portal uses the Back, Middle and Front layers of its tvOS App Store image
stack.

`ProductCardMedia` supports two treatments. The `iphone` treatment places an authentic screenshot
in a stylized device frame. The `illustration` treatment places standalone artwork, such as the WG
Portal ring, directly on the studio surface. Both anchor artwork toward the lower-right corner.
Keep the source proportions and use the card bounds to crop the composition.

Media is a background layer. The type label, title, description, release banner and full-width
download rail all paint above it. Keep their shared spacing, width and layout when changing art.
Every card uses the same artwork layer and mask, including cards with placeholder art. The mask
reveals the actual page surface around the title and description and dims the artwork by 91% under
the download rail. The same oversampled glyphs draw the visible lettering and provide the distance
field for the mask. The browser's HTML line breaks and positions determine where the text goes.
With JavaScript unavailable, the artwork stays subdued against the live text. The artwork does
not receive pointer events.

The outline profile in `app/components/cardOutlineCurve.ts` defines thickness as the distance
outward from the glyph edge in CSS pixels. Its curve maps normalized distance to opacity,
starting at full opacity at the glyph. A flat curve at full opacity has a crisp edge. A curve
ending at zero fades completely by the specified thickness. Zero thickness disables the
outline. Keep the artwork mask surface-relative so the studio gradient shows through exactly.

Current source provenance:

| Studio asset                  | Source project path                                                                                  | Dimensions  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- |
| `palette-master-gameplay.png` | Palette-Master: `store-assets/source/captures/01-relaxing-gameplay.png`                              | 1320 × 2868 |
| `ratebench-converter.png`     | exchange: `aso/store-screenshots/.generated/run-8Oj9ct/raw/ios/ios-phone-pinned/en-US/converter.png` | 1206 × 2622 |
| `wg-portal-ring.webp`         | WGPortal: `site/public/assets/portal-light.webp`                                                     | 998 × 960   |

Palette Master shows its real color-puzzle gameplay; Ratebench shows its real native iOS USD/BTC
converter. The WG Portal illustration comes from the product site's hero with a transparent center
and exterior. Add future image treatments to the typed media model and shared artwork renderer.

## Type Labels

The visible category is always GAME or APP. Add a prefix only if every planned platform belongs
to the same Mobile, Desktop or TV family:

| Planned platforms                   | Family / prefix |
| ----------------------------------- | --------------- |
| Android and/or iOS                  | MOBILE          |
| macOS, Windows and/or Linux         | DESKTOP         |
| tvOS                                | TV              |
| More than one family, including Web | No prefix       |
| Web only                            | No prefix       |

Use one space, no hyphens, dots or slashes: `MOBILE GAME`, `MOBILE APP`, `DESKTOP APP`, `TV APP`,
`GAME`, `APP`. The prefix is derived from `platforms`, not the legacy wording of `type`.
For example, a `mobile-game` planned for both Android and Windows is displayed as `GAME`.

## Platform Release Rules

Evaluate every planned platform independently:

- A non-empty, trimmed store URL makes that platform's download action active.
- A missing, undefined or whitespace-only URL produces a non-interactive `Coming Soon` state.
- If **any** planned platform is unavailable, display `In development`.
- If **all** planned platforms have active download URLs, omit that banner.
- Explicitly in-development products must never advertise an active download, even if stale
  links reach the renderer. Registry validation rejects that inconsistent input as well.

An Android launch must not hide a planned iOS release or make the whole product appear finished.
Adding another planned platform to a released product restores the banner until it launches.
Only planned platforms generate actions; do not create buttons from unrelated keys in `storeLinks`.

### No releases

```ts
platforms: ["android", "ios"],
releaseStage: "in-development",
storeLinks: {},
```

Result: `MOBILE APP` or `MOBILE GAME`, `In development`, Google Play / Coming Soon and
App Store / Coming Soon.

### Android released; iOS planned

```ts
platforms: ["android", "ios"],
// Remove releaseStage when the first release becomes available.
storeLinks: {
  android: "https://play.google.com/store/apps/details?id=com.example.app",
},
```

Result: the development banner remains, Google Play is a real link and App Store says `Coming Soon`.
When a real iOS store URL is added, both links become active and the banner disappears.

## Download Controls

- Android uses the visible label `Google Play`. iOS uses `App Store` with the App Store glyph
  from the WG Portal site's Simple Icons asset, scaled to match Google Play.
- Keep Google Play before App Store regardless of registry array order.
- An unavailable action keeps its store name/icon visible and adds `Coming Soon`, so the planned
  platform is still clear. It has no href, click handler or keyboard tab stop.
- An active action uses the real store URL, opens separately and has an accessible label containing
  both the store and product name. Store SVGs are decorative and use `currentColor`.
- WG Portal's `Apple TV` download action uses the same App Store glyph and points to its App Store
  listing. Existing generic platform labels are the fallback for other targets.
- Hover, press and keyboard focus follow the shared studio interaction system. Coming Soon states
  remain visually quiet and do not acquire interactive hover or pressed effects.

## Current Products

| Product        | Label       | Banner         | Bottom rail                                   |
| -------------- | ----------- | -------------- | --------------------------------------------- |
| Palette Master | MOBILE GAME | None           | Google Play, App Store — both active          |
| Ratebench      | MOBILE APP  | In development | Google Play — active, App Store — Coming Soon |
| WG Portal      | TV APP      | None           | Apple TV — active                             |

## Layout And Verification

Home and Products use the same component and 3/2/1 responsive grid. Keep the square minimum and
allow the frame to grow when long or enlarged text needs more room. Store controls must wrap or
stack without clipping and stay separate from the product-overview link. Placeholder artwork is
decorative; approved media is selected explicitly through the registry.

When changing these rules, run the focused product-card model/render tests and `npm run check`.
Review both public grids at mobile, tablet and desktop widths, including fully unreleased, partial
and completed releases, keyboard focus and enlarged text. Keep the pure model free of rendering,
slug-specific behavior, remote requests and manually synchronized release-state fields.
For media changes, verify image loading, intrinsic proportions, clipping at the card edges and
layer order. Compare the type, copy and control layout against the existing card composition.
