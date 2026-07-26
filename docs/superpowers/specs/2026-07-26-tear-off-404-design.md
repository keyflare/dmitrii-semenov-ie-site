# Tear-Off Poster 404 Design

## Goal

Replace the chromatic plate-alignment interaction with a single, immediately legible gesture:
tear an error poster from left to right to reveal the real `404` underneath.

The result must feel like a Keyflare Studio poster, react strongly to input, explain itself without
instructions elsewhere on the page, and remain useful without interaction or JavaScript.

## Why The Current Design Changes

The existing artwork asks the visitor to drag three visually overlapping colour layers. Their hit
areas overlap, the cursor response is only a few pixels, and there is no visible target. The user
therefore cannot tell which plate will move, how far it can move, or what successful registration
looks like.

The redesign removes all ambiguous direct manipulation:

- one handle instead of three overlapping draggable objects;
- one horizontal direction instead of free two-dimensional movement;
- a large one-to-one response instead of restrained parallax;
- an exposed blue result beneath the paper instead of an invisible alignment target.

## Composition

The page uses one wide poster composition rather than two adjacent framed cards.

1. A lightweight introduction row contains the `ERROR EDITION / 404` label, the semantic heading,
   a short sentence, and no border of its own.
2. One large bordered artwork fills the visual width below it.
3. The permanent Home and Products actions sit in a utility row below the artwork and remain
   available before, during, and after the interaction.

The normal site header, navigation, footer, operator identity, and static route behavior remain
unchanged.

## Artwork Layers

### Revealed Layer

The base layer is a saturated Keyflare blue print with a large warm-paper `404`, black hard shadow,
registration marks, a red directional strip, and small production metadata. It should feel like
the useful page was always physically underneath the error sheet.

### Error Sheet

A warm-paper sheet initially covers almost all of the blue layer. It contains oversized black
editorial copy, a red error stamp, coarse print rules, and enough static meaning for the first
server-rendered frame to read as an intentional 404.

Its left boundary is a visibly jagged vertical tear. The sheet is clipped from that boundary to the
right edge; moving the tear boundary right exposes the blue layer.

### Handle

A large amber circular handle straddles the jagged boundary. It always says `PULL →`, uses a grab
cursor, has a hard black shadow, and is paired with a short red `TEAR HERE` label. It is the only
draggable control in the artwork.

The handle moves several pixels on hover/focus, so the page gives a strong affordance before the
visitor starts dragging.

## Interaction States

### Ready

- The tear begins around 8% from the left edge so a blue sliver is already visible.
- The handle and horizontal direction are visible without hover.
- Main copy says `This page isn't here.` and tells the visitor they may pull the print aside or use
  the working exits.

### Dragging

- Pointer capture keeps the handle attached to the interaction.
- Horizontal movement maps one-to-one to tear progress.
- The error sheet clips away continuously while the blue layer remains fixed.
- Vertical pointer movement is ignored.
- The handle uses a grabbing cursor and loses its hover animation.

### Release

- At or beyond 58% progress, the tear completes and the sheet exits to the right.
- Below the threshold, the sheet returns to its ready position with one short elastic transition.
- Clicking the handle, pressing Enter, or pressing Space completes the tear without requiring a
  drag.

### Open

- The blue `404` is fully visible.
- Main copy changes to `Nothing underneath either.` with a brief line confirming the exits work.
- The pull handle disappears.
- A small `Print it again` button below the artwork restores the ready state.
- The page never redirects automatically.

## Responsive Behavior

- Desktop and tablet retain the single wide poster.
- The artwork has stable clamped dimensions rather than viewport-width typography.
- On narrow phones, the artwork becomes taller, the giant `404` scales with breakpoint-specific
  clamps, the handle shrinks but remains at least 64px, and the utility actions stack.
- The clipping boundary and handle position use the measured artwork width, so the gesture remains
  one-to-one at every breakpoint.
- No horizontal page overflow is allowed.

## Accessibility And Reduced Motion

- The semantic heading, description, and navigation actions exist outside decorative artwork
  layers and are present before hydration.
- The artwork exposes a short state-aware group label.
- Decorative poster words, the repeated `404`, registration marks, and production furniture are
  hidden from assistive technology.
- The pull handle is a real button with a descriptive accessible name.
- Keyboard activation opens the poster; the replay control restores it.
- Reduced-motion mode keeps the same interaction and states but removes hover drift, spring easing,
  and animated completion. State changes happen immediately.
- Focus styles are high-contrast and do not depend on color alone.

## Implementation Boundaries

- Replace `Chromatic404Artwork` and its plate geometry helper with focused `TearOff404Artwork`
  files.
- Keep state ownership split: the artwork owns drag progress; `NotFoundPage` owns only the
  open/closed copy state and replay command.
- Keep routing, metadata, static generation, and root error classification unchanged.
- Update the durable 404 guidance in `.ai/DESIGN.md` from chromatic calibration to the tear-off
  poster model.

## Verification

- Unit-test progress clamping, drag mapping, and completion threshold.
- Render-test useful pre-hydration content, both permanent exits, button semantics, changed copy,
  and replay.
- Test pointer dragging above and below the threshold.
- Run typecheck, lint, formatting, and tests during implementation.
- Run the full `npm run check` release gate.
- Inspect desktop and mobile screenshots and exercise mouse, keyboard, and reduced-motion states in
  the local browser.
