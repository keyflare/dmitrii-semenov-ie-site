# AGENTS.md

## Repository Purpose

This repository contains the official static website for **Keyflare Studio**, operated by
Dmitrii Semenov, Individual Entrepreneur, Armenia.

The site is a static product hub and compliance URL source for apps, games, desktop apps, and
software tools. It should not gain a backend, CMS, admin panel, or runtime server dependency unless
the owner explicitly changes that direction.

## Durable AI Guidance

Long-lived guidance for agents lives in `.ai/`:

- `.ai/SITE.md`: static site architecture, URL model, metadata, deployment-sensitive files, and
  compliance-facing constraints.
- `.ai/PRODUCT_PAGES.md`: product registry rules, publication guards, customization modes, MDX, and
  product privacy/support behavior.
- `.ai/DESIGN.md`: visual direction, typography, layout principles, document mode, and product
  theming.

`docs/superpowers/` is only for temporary specs and implementation plans during active feature work.
After a feature is complete, remove its temporary specs/plans. If a decision should survive, move it
into `.ai/` or this `AGENTS.md`.

## Codebase Map

Important source areas:

- `app/routes.ts` defines the route map.
- `app/routes/` contains route modules.
- `app/components/` contains reusable UI components.
- `app/styles/tokens.css` and `app/styles/global.css` contain global styling foundations.
- `app/content/site.ts` contains site-wide brand/operator config.
- `app/content/products/` contains product metadata, validation, privacy blocks, MDX/custom content,
  and fixture/draft product content.
- `scripts/validate-content.ts` validates product/content data.
- `scripts/generate-static-metadata.ts` generates `robots.txt` and `sitemap.xml`.
- `scripts/check-routes.ts` verifies build output.

Generated or installed directories such as `build/`, `.react-router/`, `node_modules/`, and
`.superpowers/` should not be edited manually.

## Branching And Pull Requests

`main` is the production branch.

Before making direct codebase changes, inspect the current git state.

If the worktree is in detached `HEAD`, create a task branch first.

Branch names for agent-created work branches must use the format `codex/<work-description>`, where
`<work-description>` is 1 to 5 short kebab-case words that summarize the task, for example
`codex/add-product-page`.

If the worktree is already on a named branch, continue using that branch unless the user explicitly
asks to switch or create another one.

Pull request rules for agent-created work:

- Open pull requests as ready for review, not as drafts.
- Do not add agent/tool prefixes such as `[codex]` or `Codex:` to pull request titles.
- Keep pull request titles short and describe the change in one sentence.

Deployment behavior:

- Local merge into `main` does not deploy by itself.
- Pushing to `origin/main` starts the GitHub Pages deployment workflow.
- Merging a PR into `main` also starts deployment.
- Feature branches run checks but do not deploy.

Before merging or pushing to `main`, run:

```bash
npm run check
```

## Required Local Commands

Common development commands:

```bash
npm install
npm run dev
```

Production-like local verification:

```bash
npm run check
npm run preview -- --listen tcp://127.0.0.1:4173
```

Individual checks:

```bash
npm run validate:content
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run check:routes
```

`npm run check` is the main release gate. It runs content validation, typecheck, lint, formatting
check, tests, build, and route-output checks.

## Critical Rules

- Keep the site fully static. Do not introduce backend, CMS, runtime server, client-only public
  routing, or hash-based public URLs.
- Store-facing and compliance-facing pages must remain directly reachable as static prerendered
  pages.
- Preserve `public/CNAME` and `public/app-ads.txt` unless the owner explicitly changes the public
  domain or AdMob publisher configuration.
- Never let `draft` or `fixture` products render through public product routes.
- Public product routes must use `findPublishedProduct()` or an equivalent published-only guard.
- `robots.txt` and `sitemap.xml` are generated from site config and prerender paths; do not
  hand-maintain generated metadata.

See `.ai/SITE.md` and `.ai/PRODUCT_PAGES.md` for the detailed model behind these rules.

## Testing Expectations

When changing content model, routing, metadata, product publication, deployment, or CI:

- add or update focused Vitest coverage;
- keep draft/fixture visibility tests intact;
- run `npm run check`;
- verify public root files remain in the build output.

For UI-only style changes, at minimum run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

For anything that changes routes, metadata, product publication, or CI, run the full:

```bash
npm run check
```

## Known Non-Blocking Notes

The current toolchain may print a Vite notice that `vite-tsconfig-paths` can be replaced by native
`resolve.tsconfigPaths`. This is not currently blocking.

Legal/privacy text is structural placeholder content. It must be reviewed and completed before using
the site for real product submissions.
