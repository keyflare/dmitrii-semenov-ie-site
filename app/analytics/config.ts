import { getProductPaths, getPublicPaths, products } from "../content/products/registry";
import type { Product } from "../content/products/types";
import { siteConfig } from "../content/site";
import type { AnalyticsConfig } from "./runtime";

// Website counters are separate from each product's in-app AppMetrica project.
const counters = {
  studio: 114594196,
  "palette-master": 114594650,
  ratebench: 114223600,
  wgportal: 114594894,
} as const;

export const analyticsScriptPath = "/site-analytics.js";

export function buildAnalyticsConfig(registry: Product[] = products): AnalyticsConfig {
  return {
    origin: siteConfig.canonicalOrigin,
    sites: Object.entries(counters).map(([key, counterId]) => ({
      key,
      counterId,
      paths:
        key === "studio"
          ? getPublicPaths().filter((path) => !path.startsWith("/products/"))
          : registry
              .filter((product) => product.status === "published" && product.slug === key)
              .flatMap(getProductPaths),
    })),
  };
}

export const analyticsConfig = buildAnalyticsConfig();
