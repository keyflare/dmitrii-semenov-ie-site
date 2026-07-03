import type { Product } from "./types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const lastUpdatedPattern = /^\d{4}-\d{2}-\d{2}$/;

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

    if (!lastUpdatedPattern.test(product.lastUpdated)) {
      errors.push(
        `Published product ${product.slug} has invalid lastUpdated: ${product.lastUpdated}`,
      );
    }

    for (const [platform, storeLink] of Object.entries(product.storeLinks)) {
      if (storeLink === undefined || storeLink.trim() === "") {
        continue;
      }

      if (!isValidUrl(storeLink)) {
        errors.push(
          `Published product ${product.slug} has invalid ${platform} storeLink: ${storeLink}`,
        );
      }
    }
  }

  return errors;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
