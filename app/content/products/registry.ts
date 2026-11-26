import { wgportalAdditionalPages } from "./wgportal-pages";
import { hasProductTerms, type LocalProduct, type Product, type StaticProduct } from "./types";

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
    cardIcon: { src: "/media/cards/palette-master-ios-icon.png", width: 240, height: 240 },
    cardMedia: {
      kind: "iphone",
      src: "/media/cards/palette-master-gameplay.png",
      alt: "Palette Master gameplay showing a scrambled color grid.",
      width: 1320,
      height: 2868,
    },
    type: "mobile-game",
    shortDescription:
      "An offline color puzzle game about rebuilding broken gradients tile by tile.",
    platforms: ["android", "ios"],
    supportEmail: "support@keyflare.studio",
    lastUpdated: "2026-11-23",
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
    cardIcon: { src: "/media/cards/ratebench-ios-icon.png", width: 120, height: 120 },
    cardMedia: {
      kind: "iphone",
      src: "/media/cards/ratebench-converter.png",
      alt: "Ratebench's iOS converter showing US dollar and Bitcoin amounts.",
      width: 1206,
      height: 2622,
    },
    type: "mobile-app",
    shortDescription:
      "A reference and calculation tool for comparing fiat and crypto exchange outcomes.",
    platforms: ["android", "ios"],
    supportEmail: "support@keyflare.studio",
    lastUpdated: "2026-07-26",
    storeLinks: {
      android: "https://play.google.com/store/apps/details?id=com.keyflare.exchange.android",
    },
    staticSite: {
      hasTerms: true,
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
  {
    status: "published",
    slug: "wgportal",
    name: "WG Portal",
    cardIcon: { src: "/media/cards/wg-portal-tvos-icon.png", width: 300, height: 180 },
    cardMedia: {
      kind: "illustration",
      src: "/media/cards/wg-portal-ring.webp",
      alt: "WG Portal’s luminous violet ring.",
      width: 998,
      height: 960,
    },
    type: "software",
    shortDescription: "Bring your own WireGuard or AmneziaWG VPN profile to Apple TV.",
    platforms: ["tvos"],
    supportEmail: "support@keyflare.studio",
    lastUpdated: "2026-11-13",
    storeLinks: { tvos: "https://apps.apple.com/app/id6835040683" },
    staticSite: {
      hasTerms: true,
      additionalPages: wgportalAdditionalPages,
    },
    privacyProfile: {
      usesAdMob: false,
      usesAnalytics: false,
      usesCrashReporting: false,
      usesSubscriptions: false,
      hasAccounts: false,
      collectsPersonalData: true,
      requiresDataDeletionPage: false,
      thirdPartyServices: ["Apple App Store", "Amnezia Premium (optional)"],
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

export function findPublishedLocalProduct(slug: string): LocalProduct | undefined {
  const product = findPublishedProduct(slug);
  return product?.staticSite ? undefined : product;
}

export function getPublishedStaticProducts(registry = products): StaticProduct[] {
  return registry.filter(
    (product): product is StaticProduct =>
      product.status === "published" && Boolean(product.staticSite),
  );
}

export function getProductPaths(product: Product): string[] {
  const base = `/products/${product.slug}`;
  const paths = [base, `${base}/privacy`, `${base}/support`];

  if (hasProductTerms(product)) {
    paths.push(`${base}/terms`);
  }

  if (product.privacyProfile.requiresDataDeletionPage) {
    paths.push(`${base}/data-deletion`);
  }

  if (product.staticSite?.additionalPages) {
    paths.push(...product.staticSite.additionalPages.map((path) => `${base}/${path}`));
  }

  return paths;
}

export function getPrerenderPaths() {
  const localProducts = getPublishedProducts().filter((product) => !product.staticSite);
  return [...staticPrerenderPaths, ...localProducts.flatMap(getProductPaths)];
}

export function getPublicPaths() {
  return [...staticPrerenderPaths, ...getPublishedProducts().flatMap(getProductPaths)];
}
