# Design Guidance

This guidance covers the studio website and its shared components. Project-owned static exports
(Ratebench and WG Portal) own their design systems, layouts, fonts and assets. Studio styling must
never be injected into those exports.

## Approved Direction

The studio uses **Suprematist Studio**, based on the approved third homepage concept. Its identity
combines warm ivory paper, near-black editorial typography, clear geometric composition, a diagonal
retro spectrum, and selective transparent amber glass. It should feel like an independent creative
studio, with structure and confident asymmetry rather than a generic startup template.

The current light-surface header logo is the owner's supplied `Frame 35.svg`, stored at
`public/brand/keyflare-studio-wordmark.svg`. Preserve its 147:33 proportions and its complete
wordmark/flame artwork; do not rebuild it as live text. The favicon uses the separate flame/keyhole
symbol. The retained legacy dark wordmark has its own 145:39 aspect ratio.

## Foundations And Ownership

- `app/styles/tokens.css` owns semantic colors, paper surfaces, layout widths, spacing, line weight,
  radii, typography and interaction timing.
- `app/styles/global.css` owns resets, accessibility helpers and studio-level section grids.
- Components own their layout, decoration and states in CSS Modules. Avoid route-specific overrides
  of component internals.
- `SiteShell` owns the studio wordmark, navigation, skip link, content gutter and legal footer.
  At desktop widths (900px and up), its header-height token is 67.5% of the original scale: an
  81px maximum instead of 120px. Smaller layouts use the same further 10% reduction, and the
  wordmark is 85% of its previous responsive size. Let navigation grow when enlarged text needs
  wrapping.
- Keep all existing public copy, metadata, navigation and publication guards intact during styling.
- The site remains fully static. Decorative art renders without JavaScript or remote rendering.
  Product cards refine artwork opacity locally after the page loads.

## Typography

The display family is **Unbounded Variable**, weight 900. Its broad geometric letterforms and
single-storey forms were compared visually against the approved reference. Body and UI use
**DM Sans Variable**. Both are hosted locally through Fontsource; there are no runtime font-CDN
requests. Existing product font packages remain available to studio-rendered product content.

Use display type for the hero, section titles and product names. Use body type for descriptions,
controls, metadata and readable documents. Preserve mixed case; do not uppercase display headlines.
The footer brand name uses DM Sans at weight 500 with normal tracking for a quieter signature.
Tracking may be tightened for large display type, while small product markers use modest positive
tracking. Never apply display tracking to paragraphs.

Ordinary page headings have bounded sizes. The art-directed homepage is a deliberate exception:
its typography scales with its own CSS container, and per-line horizontal metric corrections match
the approved composition. Its four-line slogan is live text with a single accessible heading name.
Shared PageHeader titles remain single-line and scale down on phones; document titles are calmer.

## Hero Composition

`StudioHero` is a self-contained visual component. Keep the staircase arrangement of Tiny / apps,
/ loud / ideas., the cropped black circle, the translucent red square, the diagonal four-color
spectrum and the cobalt lower-right block. Cropping is intentional for decorative geometry only;
headlines, descriptions, actions and focus outlines must stay within the viewport.

The amber glass is positioned relative to the **i in ideas**, never from a viewport pixel coordinate.
Its horizontal center uses the letter's full advance: tracking is reset on that glyph and compensated
on the following run. Only this i paints below the glass; Tiny, apps, loud and the remaining letters
paint above it. The spectrum stays behind all typography. Upper glass is warm amber, while the
lower face is more transparent and uses multiply blending to retain the dark letter underneath.

At desktop widths, the central canvas scales from the available viewport height after reserving
space for navigation, supporting copy and actions. It has its own bounded width rather than
stretching to the general page maximum. Red glass, the black circle, the diagonal spectrum and the
cobalt block extend into the outer wings, so the scene remains composed on wide rectangular windows.
Compact desktop canvases can place supporting copy across the canvas to keep both actions visible.
Phones retain the four-line composition, with the glass beginning below navigation.

The red square uses layered radial shading, restrained grain, a narrow warm bevel and one soft
highlight aligned to the glass edge. Avoid multiple outlined frames, inset white grooves and
cross-shaped light streaks. The spectrum is composed of four independent color bands; each owns
nonlinear shade variation along and across its surface. Intersecting canvas-relative masks keep
its fade around the author byline and softly reduce opacity at the loud/ideas letter counters.
The typography remains opaque above the spectrum.

The spectrum's geometric top edge and the black circle's cut share the same 19-degree slope.
The extended masking field must not introduce a horizontal crop inside the hero.

## Color And Material

Use the existing spectrum: coral/red, amber, mint/green and cobalt/blue. Gradients belong to the
spectrum, transparent materials, small graphic corners and placeholder artwork. Use near-black ink
for typography, frames and primary actions. The warm paper surface is the common foundation.

Glass is an accent, not a panel around every section. Keep borders sharp, radii square and shadows
restrained. Avoid floating nested cards, generic blurred blobs, bokeh and unnecessary ornaments.

## Product Cards

`ProductCard` owns metadata, product overview navigation and store controls. Optional typed
`cardMedia` in the registry selects product imagery approved individually for that product.
`ProductCardMedia` anchors artwork toward the lower right and clips it to the frame of the card.
Palette Master and Ratebench use authentic screenshots in a stylized iPhone frame. WG Portal uses
its transparent ring illustration. `ProductPlaceholder` supplies decorative artwork for products
awaiting approved media. The same layer applies the glyph-following outline and translucent
download rail to every card. Keep copy and download controls on their shared layout above the art.

The homepage and catalog share one responsive grid rule: three equal square cards per row at
1200px and up, two at 761–1199px, and one at 760px and below. Preserve registry order; do not invent
filler products. Retain a square wherever content fits, while narrow layouts and enlarged text can
grow vertically to preserve readable copy and controls. Never clip descriptions or hide required
links to force a square. Product actions form a download-only bottom rail, and a development
banner remains visible until every planned platform has launched. Follow
[PRODUCT_CARDS.md](./PRODUCT_CARDS.md) for the shared card anatomy, automatic type labels and
per-platform Coming Soon states.

The square is a width-derived minimum on the content wrapper. The outer frame follows its natural
height; do not combine a fixed outer aspect ratio with a percentage minimum height on the content.
That combination can let enlarged text and action rails overlap the following card.

## Interaction

`PosterButton` owns the shared anchor treatment. Primary actions are ink-filled; secondary actions
are outlined. Hover adds a small offset print shadow and amber/coral accent. Press returns the
surface to the page with a distinct color and collapsed shadow. Keyboard focus uses a separate
visible cobalt outline. The two studio hero actions use `raised` to show the lifted treatment
at rest and the flat treatment on hover. The press state applies while the control is activated.

Card download links have their own flat rail treatment. Keep their hit areas generous and their focus
rings visible. Card overview navigation and downloads remain independent keyboard targets, without
nested anchors. Coming Soon states are non-interactive text, not fake buttons or dead links.
Reduced-motion users keep all states without position changes or transitions.

## Documents And Secondary Pages

Catalog, contact, website privacy, legal and error pages share the studio tokens, wordmark and
interaction system. Policy and legal text retain constrained reading widths, clear headings, quiet
surfaces and restrained color rails. Product identities and their own page artwork remain separate.

Studio document headings use local Phosphor Fill SVGs: a mint lock/keyhole for Privacy, an amber
seal/check for Legal, and a coral paper plane for Contact. `PageIcon` owns their shared weight and
scale; the complete silhouette uses the studio color tokens. Keep these decorative and hidden from
assistive technology. Their MIT notice ships at `public/licenses/phosphor-icons.txt`.

## Product Theming

Product differentiation should be intentional and inspectable rather than one-off CSS drift.

Product theme metadata may define:

- `accentPrimary`;
- `accentSecondary`;
- `accentTertiary`;
- `ink`;
- `surface`;
- `gradient`;
- `visualVolume` with values such as `calm`, `poster`, and `immersive`;
- an optional named `pageSurface` preset for a product-specific full-bleed background.

Page-surface presets must be static, typed, and inspectable. Apply them through the shared product
page frame so overview, Privacy, Terms, Support, and Data Deletion pages can share one product world
without mutating `body` or relying on client-side effects. Products without a preset must keep the
default studio background. The studio header and footer remain unchanged even when the product
content background is customized.

Custom overview pages may have product-specific composition, theme colors, media rhythm, and visual
personality. They must still preserve:

- direct `/products/:slug/` routing;
- visible links to privacy and support;
- optional data deletion link when required;
- metadata from the product registry;
- publication guards through `findPublishedProduct()`;
- the studio footer/legal identity.

## Page Guidance

The homepage should be the loudest studio-level page and make the Keyflare Studio brand
unmistakable in the first viewport.

The catalog should feel like a product wall or launch board, not a plain list.

Product overview pages may vary more than other page types, but must keep clear product purpose,
platform/store links when available, support and privacy links, and publication guards.

Privacy, support, legal, and data deletion pages should preserve generated compliance sections, keep
text highly readable, use restrained brand accents, and avoid oversized decorative modules inside
dense policy text.

## Not Found Page

The studio-level 404 page uses a **tear-off error poster** metaphor inside the normal warm-paper
Suprematist Studio system. A warm error sheet sits above a saturated blue `404` print, and a large
amber `PULL` handle makes the horizontal reveal gesture explicit.

Use one handle, one horizontal direction, and one-to-one pointer or touch response. Do not return to
overlapping draggable colour plates or restrained cursor parallax: the interaction should explain
itself before movement begins. Crossing the visible threshold may tear the sheet away, revise the
copy, and expose a replay action, but it must never redirect automatically.

Keep these guarantees:

- the normal Keyflare Studio header, navigation, footer, and legal identity remain visible;
- Home and Products links are available immediately without solving the interaction;
- the page is understandable before JavaScript hydration;
- the pull handle is a real keyboard-operable button and decorative print layers are hidden from
  assistive technology;
- reduced-motion users keep the same useful states without spring, hover-drift, or completion
  animation;
- mobile layouts keep the 404 inside the viewport without horizontal overflow;
- unexpected non-404 failures use the calm generic error view rather than the playful 404 concept.
