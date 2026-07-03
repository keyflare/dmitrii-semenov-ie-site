import type { Product } from "./types";

const staticPrerenderPaths = ["/", "/products", "/about", "/contact", "/legal", "/legal/privacy"];

export const products: Product[] = [
  {
    status: "fixture",
    slug: "fixture-product",
    name: "Fixture Product",
    type: "mobile-app",
    shortDescription: "Development-only product used to validate templates.",
    platforms: ["ios", "android"],
    supportEmail: "support@example.com",
    lastUpdated: "2026-07-03",
    storeLinks: {},
    privacyProfile: {
      usesAdMob: true,
      usesAnalytics: false,
      usesCrashReporting: false,
      hasAccounts: false,
      collectsPersonalData: false,
      requiresDataDeletionPage: false,
      thirdPartyServices: ["Google AdMob"],
    },
  },
];

export function getPublishedProducts() {
  return products.filter((product) => product.status === "published");
}

export function getRoutableProducts() {
  return products.filter(
    (product) => product.status === "published" || product.status === "fixture",
  );
}

export function findRoutableProduct(slug: string) {
  return getRoutableProducts().find((product) => product.slug === slug);
}

export function getPrerenderPaths() {
  const productPaths = getPublishedProducts().flatMap((product) => {
    const paths = [
      `/products/${product.slug}`,
      `/products/${product.slug}/privacy`,
      `/products/${product.slug}/support`,
    ];

    if (product.privacyProfile.requiresDataDeletionPage) {
      paths.push(`/products/${product.slug}/data-deletion`);
    }

    return paths;
  });

  return [...staticPrerenderPaths, ...productPaths];
}
