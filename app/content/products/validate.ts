import { productCustomOverviewKeys, productMdxContentKeys, type Product } from "./types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const lastUpdatedPattern = /^\d{4}-\d{2}-\d{2}$/;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
const gradientPattern = /^(repeating-)?(linear|radial|conic)-gradient\((.+)\)$/;

export function validateProducts(products: Product[]): string[] {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();
  const duplicateSlugs = new Set<string>();

  for (const product of products) {
    if (seenSlugs.has(product.slug)) {
      duplicateSlugs.add(product.slug);
    }

    seenSlugs.add(product.slug);
  }

  for (const slug of duplicateSlugs) {
    errors.push(`Duplicate product slug: ${slug}`);
  }

  for (const product of products) {
    if (product.status !== "published") {
      continue;
    }

    if (!slugPattern.test(product.slug)) {
      errors.push(`Published product ${product.slug} has invalid slug`);
    }

    if (!product.name.trim()) {
      errors.push(`Published product ${product.slug} is missing name`);
    }

    if (!product.shortDescription.trim()) {
      errors.push(`Published product ${product.slug} is missing shortDescription`);
    }

    if (!product.supportEmail.trim()) {
      errors.push(`Published product ${product.slug} is missing supportEmail`);
    }

    if (product.platforms.length === 0) {
      errors.push(`Published product ${product.slug} is missing platforms`);
    }

    if (!isValidLastUpdated(product.lastUpdated)) {
      errors.push(
        `Published product ${product.slug} has invalid lastUpdated: ${product.lastUpdated}`,
      );
    }

    for (const [platform, storeLink] of Object.entries(product.storeLinks)) {
      if (storeLink === undefined || storeLink.trim() === "") {
        continue;
      }

      if (!isValidHttpsUrl(storeLink)) {
        errors.push(
          `Published product ${product.slug} has invalid ${platform} storeLink: ${storeLink}`,
        );
      }
    }

    validateProductTheme(product, errors);
    validatePresentation(product, errors);
  }

  return errors;
}

function validateProductTheme(product: Product, errors: string[]) {
  if (!product.theme) {
    return;
  }

  const colorEntries = [
    ["accentPrimary", product.theme.accentPrimary],
    ["accentSecondary", product.theme.accentSecondary],
    ["accentTertiary", product.theme.accentTertiary],
    ["ink", product.theme.ink],
    ["surface", product.theme.surface],
  ] as const;

  for (const [field, value] of colorEntries) {
    if (!hexColorPattern.test(value)) {
      errors.push(`${product.slug} theme.${field} must be a six-digit hex color.`);
    }
  }

  if (!gradientPattern.test(product.theme.gradient.trim())) {
    errors.push(`${product.slug} theme.gradient must be a CSS gradient value.`);
  }
}

function validatePresentation(product: Product, errors: string[]) {
  const presentation = product.presentation;

  if (!presentation) {
    errors.push(`Published product ${product.slug} is missing presentation`);
    return;
  }

  const overview = presentation.overview;

  if (
    overview.mode === "custom" &&
    !hasKnownKey(productCustomOverviewKeys, overview.componentKey)
  ) {
    errors.push(
      `Published product ${product.slug} references unknown custom overview: ${String(
        overview.componentKey,
      )}`,
    );
  }

  if (
    overview.mode === "standard-with-mdx" &&
    !hasKnownKey(productMdxContentKeys, overview.contentKey)
  ) {
    errors.push(
      `Published product ${product.slug} references unknown MDX content: ${String(
        overview.contentKey,
      )}`,
    );
  }

  const support = presentation.support;

  if (support.mode === "mdx" && !hasKnownKey(productMdxContentKeys, support.contentKey)) {
    errors.push(
      `Published product ${product.slug} references unknown MDX content: ${String(
        support.contentKey,
      )}`,
    );
  }

  const privacy = presentation.privacy;

  if (
    (privacy.mode === "generated-with-mdx" || privacy.mode === "mdx") &&
    !hasKnownKey(productMdxContentKeys, privacy.contentKey)
  ) {
    errors.push(
      `Published product ${product.slug} references unknown MDX content: ${String(
        privacy.contentKey,
      )}`,
    );
  }
}

function hasKnownKey(keys: readonly string[], key: unknown): key is string {
  return typeof key === "string" && keys.includes(key);
}

function isValidLastUpdated(value: string): boolean {
  if (!lastUpdatedPattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
