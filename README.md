# Keyflare Studio Site

Static product hub for Keyflare Studio.

## Development

Install dependencies:

```bash
npm install
```

Configure Git credentials for the private product repositories in `product-sites.json`. If you
use the GitHub CLI, run `gh auth setup-git` after signing in. Dev and build fetch the selected tags.

Start the local development server:

```bash
npm run dev
```

## Local Production Check

Run the full local check:

```bash
npm run check
```

Preview the production build:

```bash
npm run preview
```

`main` is production. Feature work should happen on short-lived branches. Pages deployment runs from Actions after checks pass on `main`.

## Deployment

Production is deployed from `main` through GitHub Actions.

Repository settings:

1. Open GitHub repository settings.
2. Open Pages.
3. Set Build and deployment source to GitHub Actions.
4. Keep the custom domain configured for the production domain.

Feature branches run checks but do not deploy.
Merging to `main` is the release action.

## Product website releases

Each published project-owned website is pinned in `product-sites.json` by GitHub repository,
release tag, and the tag's dereferenced commit SHA. The optional `directory` selects the
publishable subtree inside a tagged commit. See
[product page guidance](.ai/PRODUCT_PAGES.md#project-owned-static-sites) for the static export contract.

The deploy workflow uses `EXCHANGE_SITE_READ_KEY` in the `github-pages` environment to read
Exchange over SSH. The matching deploy key on `keyflare/exchange` grants read-only access. For
multiple private project repositories, the workflow also accepts `PRODUCT_SITES_READ_TOKEN`, a
fine-grained token scoped to the selected repositories with read-only Contents access. The
`github-pages` environment grants access on `main`.

Branch and PR checks run `npm run check:code`, which includes Git import tests with local fixture
repositories. Run `npm run check` locally to verify the configured release tags and the assembled
site before merging. Deployment also runs the full check.
