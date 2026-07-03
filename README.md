# Keyflare Studio Site

Static product hub for Keyflare Studio.

## Development

Install dependencies:

```bash
npm install
```

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
