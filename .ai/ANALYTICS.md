# Website Analytics

Website analytics uses one Yandex Metrica counter per logical website. AppMetrica inside a product
is independent and must not be changed by website analytics work.

## Ownership

`app/analytics/config.ts` is the typed source of counter IDs and route ownership:

- Studio owns `/`, `/products/`, `/contact/`, `/privacy/`, and `/legal/`.
- Palette Master owns its published `/products/palette-master/` pages.
- Ratebench owns its published `/products/ratebench/` pages and retains counter **114223600**.
- WG Portal owns its published `/products/wgportal/` pages.

The exact page list comes from the published product registry. Every public page has exactly one
owner. Products do not send pageviews or interactions to Studio. New public products need an
explicit ownership decision and focused coverage before release. Missing counter IDs block runtime
generation. Counter reporting timezone is **Europe/Moscow (UTC+3)**.

Collection runs only on `https://www.keyflare.studio` and declared public paths. Local development,
previews, unknown URLs, draft products and fixture products do not initialize a counter or send
pageviews or goals. The fallback/404 HTML can contain the shared script; its unknown URL has no owner.

## Shared Runtime And Navigation

`app/analytics/runtime.ts` is the only browser implementation. `npm run generate:analytics` compiles
it together with the central configuration into generated, ignored `public/site-analytics.js`.
Both dev and build generate this file. It is a static asset and adds no runtime server dependency.

The React root declares the script once. Imported complete HTML exports receive the same declaration
during publication in `scripts/stage-product-sites.ts`. The HTML and JavaScript parsers in
`scripts/analytics-publication.ts` reject independent Metrica loaders, initializers, event senders,
and duplicate shared installations. Fix and release the source export instead of stripping a
product-specific filename. Application JavaScript, CSS and layout continue to belong to the product.
`npm run check:routes` verifies one installation in every declared public HTML file and the runtime
asset, alongside the required public root files.

Studio-rendered links use `SiteLink`. Crossing an ownership boundary uses document navigation so
the new document initializes its own counter. Links within Studio or Palette Master can use SPA
navigation. Imported native anchors already navigate documents.

Initialization uses `defer: true`, followed by an explicit initial `hit`. History push/replace and
back/forward navigation send manual hits; hash-only edits and URL normalization do not. A repeated
visit to the same page is valid, including a new history entry or a restored back/forward-cache
page. Runtime installation, provider loading and per-counter initialization are idempotent. The
runtime avoids automatic pageviews, Session Replay, click maps, automatic outbound-link tracking,
ecommerce and bounce timers. Every counter also sets `disableYtm: true`. Tag management must
remain disabled in the Metrica settings as well;
no tag-manager container is installed here.

## Goals And Reports

Create the same six JavaScript-event goals on all website counters:

| Goal                | Interaction                                                   |
| ------------------- | ------------------------------------------------------------- |
| `google_play_click` | Google Play link, retaining Ratebench's existing goal history |
| `app_store_click`   | Apple App Store link                                          |
| `support_click`     | `mailto:` or `tel:` link                                      |
| `navigation_click`  | Other same-origin link                                        |
| `outbound_click`    | Other external HTTP(S) link                                   |
| `button_click`      | Button or element with `role="button"`                        |

Classification is mutually exclusive in that priority order. Delegation snapshots source metadata
in document capture and reports in document bubble, after target and React handlers. Do not report
from a capture microtask: trusted browser events can flush it before those handlers run. A store link sends its store goal,
not a second outbound goal. Delegation handles nested targets, keyboard-generated clicks,
Ctrl/Meta/new-tab links and middle clicks. Disabled, inert and cancelled actions are excluded.
Accepted SPA navigation still counts when React Router intentionally prevents the native action,
including navigation that awaits a route loader. `SiteLink` marks the accepted native click after
user handlers have had the opportunity to cancel it.
Repeated activations are separate events; there is no time-based click suppression.

Goal parameters include `website`, optional `product`, `source_page`, optional `destination`,
`element_id`, `label`, `location`, and `action`. Use goal conversion reports for totals, and session
parameter breakdowns to distinguish controls and placements. `data-analytics-id`,
`data-analytics-label`, and `data-analytics-location` provide stable semantic metadata. Prefer them
for repeated or icon-only controls; Palette Master screenshot controls use `screenshot-previous`
and `screenshot-next`. Do not put user data in these attributes or in accessible control labels.

## Data Boundaries And Disclosures

Page, referrer and destination URLs omit fragments, credentials and arbitrary query parameters.
The acquisition allowlist is `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
and `utm_id`, with a 128-character value limit. Campaign values must contain campaign metadata,
never personal information. Google Play destinations may retain the validated package `id`.
Email and telephone destinations omit subject, body and other query parameters. Form values and
editable content are never read for labels. Automatic document-title collection is disabled.

Website privacy disclosures belong in the Studio policy and each product website policy. Keep
website collection distinct from any in-app analytics or crash SDK. Source-owned imported policy
changes must be released upstream and pinned through `product-sites.json`. Provider processing,
retention and international transfers are described by the [Yandex Privacy Policy](https://yandex.com/legal/confidential/);
visitors can use the [Metrica opt-out](https://yandex.com/support/metrica/en/general/opt-out.html).

API references: [initialization](https://yandex.com/support/metrica/en/code/counter-initialize),
[manual pageviews](https://yandex.com/support/metrica/en/objects/hit), and
[goals](https://yandex.com/support/metrica/en/objects/reachgoal).
