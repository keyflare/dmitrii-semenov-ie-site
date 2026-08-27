# Palette Master iOS Release Design

## Goal

Replace every Palette Master iOS App Store placeholder with the published application link:
`https://apps.apple.com/app/id6785084110`.

## Design

The Palette Master product registry remains the source of truth for store availability. Add the
published URL as `storeLinks.ios`, allowing shared product cards to render a real App Store action.

The custom Palette Master overview will read both store URLs from `product.storeLinks`. When the iOS
URL is present, its platform card will be an external link with the same new-tab and noreferrer
behavior as Google Play, and its availability copy will read `Available now`. The hero platform
label will read `iOS` instead of `iOS Coming Soon`.

## Testing

Focused tests will assert that Palette Master exposes the exact App Store URL, that both shared and
custom product views render it, and that Palette Master no longer renders iOS coming-soon copy.
Existing validation and the repository's UI-only verification commands will be run after the
change.

## Out of Scope

No routes, publication status, privacy content, visual styling, or other products will change.
