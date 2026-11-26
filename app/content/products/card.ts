import type { Product, ProductPlatform, ProductType } from "./types";

type CardProduct = Pick<Product, "type" | "platforms" | "storeLinks" | "releaseStage">;

const productKinds: Record<ProductType, "APP" | "GAME"> = {
  "mobile-game": "GAME",
  "mobile-app": "APP",
  "desktop-app": "APP",
  tool: "APP",
  software: "APP",
};

const platformFamilies: Record<ProductPlatform, "MOBILE" | "DESKTOP" | "TV" | "WEB"> = {
  android: "MOBILE",
  ios: "MOBILE",
  tvos: "TV",
  macos: "DESKTOP",
  windows: "DESKTOP",
  linux: "DESKTOP",
  web: "WEB",
};

const downloadLabels: Record<ProductPlatform, string> = {
  android: "Google Play",
  ios: "App Store",
  tvos: "Apple TV",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  web: "Web",
};

const platformOrder: ProductPlatform[] = [
  "android",
  "ios",
  "tvos",
  "macos",
  "windows",
  "linux",
  "web",
];

/** Registry publication and platform release availability are independent. */
export function getProductCardModel(product: CardProduct) {
  const families = new Set(product.platforms.map((platform) => platformFamilies[platform]));
  const [family] = families;
  const prefix = families.size === 1 && family !== "WEB" ? `${family} ` : "";
  const downloads = platformOrder
    .filter((platform) => product.platforms.includes(platform))
    .map((platform) => ({
      platform,
      label: downloadLabels[platform],
      href:
        product.releaseStage === "in-development"
          ? undefined
          : product.storeLinks[platform]?.trim() || undefined,
    }));

  return {
    typeLabel: `${prefix}${productKinds[product.type]}`,
    downloads,
    hasUnreleasedPlatforms: downloads.some(({ href }) => !href),
  };
}
