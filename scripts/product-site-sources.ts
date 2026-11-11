import { createHash } from "node:crypto";
import { join } from "node:path";
import sources from "../product-sites.json";
import { getPublishedStaticProducts } from "../app/content/products/registry";
import type { Product } from "../app/content/products/types";

export type ProductSiteSource = {
  repository: string;
  tag: string;
  commit: string;
  directory?: string;
};
export const productSiteSources: Record<string, ProductSiteSource> = sources;
export const productSiteCache = ".product-sites";

export function getProductSiteDirectory(cache: string, slug: string) {
  const { commit, directory } = productSiteSources[slug];
  const tree = directory ? createHash("sha256").update(directory).digest("hex") : "root";
  return join(cache, slug, commit, tree);
}

export function validateProductSiteSources(registry: Product[]) {
  const errors: string[] = [];
  const keys = new Set(
    registry.filter((product) => product.staticSite).map((product) => product.slug),
  );

  for (const [slug, source] of Object.entries(productSiteSources)) {
    if (!keys.has(slug)) {
      errors.push(`Product site source ${slug} needs a matching static product in the registry.`);
    }
    if (
      !source ||
      !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(source.repository) ||
      typeof source.tag !== "string" ||
      !source.tag ||
      typeof source.commit !== "string" ||
      !/^[0-9a-f]{40}$/.test(source.commit)
    ) {
      errors.push(
        `Product site source ${slug} must specify a GitHub owner/repository, tag and full commit SHA.`,
      );
    } else if (
      source.directory !== undefined &&
      (typeof source.directory !== "string" ||
        source.directory.includes("\\") ||
        source.directory.split("/").some((part) => part === "" || part === "." || part === ".."))
    ) {
      errors.push(`Product site source ${slug} needs a repository-relative directory.`);
    }
  }

  for (const { slug } of getPublishedStaticProducts(registry)) {
    if (!Object.hasOwn(productSiteSources, slug)) {
      errors.push(
        `Published static product ${slug} is missing a Git source in product-sites.json.`,
      );
    }
  }

  return errors;
}
