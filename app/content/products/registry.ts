import type { Product } from "./types";

const staticPrerenderPaths = ["/", "/products", "/contact", "/privacy", "/legal"];

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
    presentation: {
      overview: { mode: "standard" },
      support: { mode: "standard" },
      privacy: { mode: "generated" },
    },
    privacyProfile: {
      usesAdMob: true,
      usesAnalytics: false,
      usesCrashReporting: false,
      usesSubscriptions: false,
      hasAccounts: false,
      collectsPersonalData: false,
      requiresDataDeletionPage: false,
      thirdPartyServices: ["Google AdMob"],
    },
  },
  {
    status: "published",
    slug: "palette-master",
    name: "Palette Master",
    type: "mobile-game",
    shortDescription:
      "An offline color puzzle game about rebuilding broken gradients tile by tile.",
    platforms: ["android", "ios"],
    supportEmail: "support@keyflare.studio",
    lastUpdated: "2026-07-08",
    storeLinks: {
      android: "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&hl=en",
      ios: "https://apps.apple.com/app/id6785084110",
    },
    presentation: {
      overview: { mode: "custom", componentKey: "palette-master" },
      support: { mode: "mdx", contentKey: "palette-master-support" },
      privacy: { mode: "mdx", contentKey: "palette-master-privacy" },
    },
    theme: {
      accentPrimary: "#ff4f64",
      accentSecondary: "#ffb000",
      accentTertiary: "#19d3a2",
      ink: "#15111c",
      surface: "#fff4d7",
      gradient: "linear-gradient(90deg, #ff4f64, #ffb000, #19d3a2, #2563ff)",
      visualVolume: "poster",
    },
    privacyProfile: {
      usesAdMob: true,
      usesAnalytics: true,
      usesCrashReporting: true,
      usesSubscriptions: false,
      hasAccounts: false,
      collectsPersonalData: true,
      requiresDataDeletionPage: false,
      thirdPartyServices: ["Google AdMob", "Google User Messaging Platform", "AppMetrica"],
    },
  },
  {
    status: "published",
    slug: "ratebench",
    name: "Ratebench",
    type: "mobile-app",
    shortDescription:
      "A reference and calculation tool for comparing fiat and crypto exchange outcomes.",
    platforms: ["android", "ios"],
    releaseStage: "in-development",
    supportEmail: "support@keyflare.studio",
    lastUpdated: "2026-07-26",
    storeLinks: {},
    presentation: {
      overview: { mode: "custom", componentKey: "ratebench" },
      support: { mode: "mdx", contentKey: "ratebench-support" },
      privacy: { mode: "mdx", contentKey: "ratebench-privacy" },
      terms: { mode: "mdx", contentKey: "ratebench-terms" },
    },
    theme: {
      accentPrimary: "#196dff",
      accentSecondary: "#3cb200",
      accentTertiary: "#fea00a",
      ink: "#161618",
      surface: "#ffffff",
      gradient: "linear-gradient(90deg, #196dff 0 78%, #3cb200 78% 91%, #fea00a 91%)",
      visualVolume: "calm",
      pageSurface: "ledger",
    },
    privacyProfile: {
      usesAdMob: false,
      usesAnalytics: true,
      usesCrashReporting: true,
      usesSubscriptions: true,
      hasAccounts: false,
      collectsPersonalData: true,
      requiresDataDeletionPage: false,
      thirdPartyServices: [
        "AppMetrica",
        "Render",
        "CoinGecko",
        "Frankfurter",
        "Open Exchange Rates",
        "Apple App Store",
        "Google Play",
      ],
    },
  },
];

export function getPublishedProducts() {
  return products.filter((product) => product.status === "published");
}

export function findPublishedProduct(slug: string) {
  return getPublishedProducts().find((product) => product.slug === slug);
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

    if (product.presentation.terms) {
      paths.push(`/products/${product.slug}/terms`);
    }

    if (product.privacyProfile.requiresDataDeletionPage) {
      paths.push(`/products/${product.slug}/data-deletion`);
    }

    return paths;
  });

  return [...staticPrerenderPaths, ...productPaths];
}
