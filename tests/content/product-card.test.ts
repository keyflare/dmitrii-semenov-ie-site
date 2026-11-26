import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { getProductCardModel } from "../../app/content/products/card";
import { getPublishedProducts } from "../../app/content/products/registry";
import type { ProductPlatform, ProductType } from "../../app/content/products/types";

const androidUrl = "https://play.google.com/store/apps/details?id=example";
const iosUrl = "https://apps.apple.com/app/id123456789";
const mobileApp = {
  type: "mobile-app" as const,
  platforms: ["android", "ios"] as ProductPlatform[],
  storeLinks: {},
};

describe("product card rules", () => {
  test("approved card images exist and PNG dimensions match the registry", () => {
    for (const product of getPublishedProducts()) {
      for (const asset of [product.cardMedia, product.cardIcon]) {
        if (!asset) continue;
        const image = readFileSync(`public${asset.src}`);
        expect(image.length).toBeGreaterThan(0);
        if (!asset.src.endsWith(".png")) continue;
        expect(image.subarray(1, 4).toString()).toBe("PNG");
        expect(image.readUInt32BE(16)).toBe(asset.width);
        expect(image.readUInt32BE(20)).toBe(asset.height);
      }
    }
  });
  test.each<{ type: ProductType; platforms: ProductPlatform[]; label: string }>([
    { type: "mobile-game", platforms: ["android", "ios"], label: "MOBILE GAME" },
    { type: "mobile-app", platforms: ["ios"], label: "MOBILE APP" },
    { type: "desktop-app", platforms: ["macos", "windows", "linux"], label: "DESKTOP APP" },
    { type: "software", platforms: ["tvos"], label: "TV APP" },
    { type: "software", platforms: ["windows"], label: "DESKTOP APP" },
    { type: "tool", platforms: ["android"], label: "MOBILE APP" },
    { type: "mobile-game", platforms: ["tvos"], label: "TV GAME" },
    { type: "mobile-game", platforms: ["ios", "windows"], label: "GAME" },
    { type: "mobile-app", platforms: ["android", "macos"], label: "APP" },
    { type: "software", platforms: ["ios", "tvos"], label: "APP" },
    { type: "software", platforms: ["web"], label: "APP" },
    { type: "mobile-game", platforms: ["android", "web"], label: "GAME" },
  ])("derives $label from $type on $platforms", ({ type, platforms, label }) => {
    expect(getProductCardModel({ ...mobileApp, type, platforms }).typeLabel).toBe(label);
  });

  test("keeps an unreleased product visible with both planned stores coming soon", () => {
    const card = getProductCardModel({ ...mobileApp, releaseStage: "in-development" });
    expect(card.hasUnreleasedPlatforms).toBe(true);
    expect(card.downloads).toEqual([
      { platform: "android", label: "Google Play", href: undefined },
      { platform: "ios", label: "App Store", href: undefined },
    ]);
  });

  test("detects a partial release without needing a manual development flag", () => {
    const card = getProductCardModel({ ...mobileApp, storeLinks: { android: androidUrl } });
    expect(card.hasUnreleasedPlatforms).toBe(true);
    expect(card.downloads).toEqual([
      { platform: "android", label: "Google Play", href: androidUrl },
      { platform: "ios", label: "App Store", href: undefined },
    ]);
  });

  test("removes the development banner only when all planned platforms have releases", () => {
    const card = getProductCardModel({
      ...mobileApp,
      storeLinks: { android: androidUrl, ios: iosUrl },
    });
    expect(card.hasUnreleasedPlatforms).toBe(false);
    expect(card.downloads.map(({ href }) => href)).toEqual([androidUrl, iosUrl]);
  });

  test("adding a planned platform restores the banner and adds its coming-soon control", () => {
    const card = getProductCardModel({
      ...mobileApp,
      platforms: ["ios", "android", "tvos"],
      storeLinks: { android: androidUrl, ios: iosUrl },
    });
    expect(card.typeLabel).toBe("APP");
    expect(card.hasUnreleasedPlatforms).toBe(true);
    expect(card.downloads.at(-1)).toEqual({
      platform: "tvos",
      label: "Apple TV",
      href: undefined,
    });
  });

  test("normalizes store URLs and treats blank values as unreleased", () => {
    const card = getProductCardModel({
      ...mobileApp,
      storeLinks: { android: ` ${androidUrl} `, ios: "  " },
    });
    expect(card.hasUnreleasedPlatforms).toBe(true);
    expect(card.downloads.map(({ href }) => href)).toEqual([androidUrl, undefined]);
  });

  test("never advertises stale store URLs on explicitly in-development products", () => {
    const card = getProductCardModel({
      ...mobileApp,
      releaseStage: "in-development",
      storeLinks: { android: androidUrl, ios: iosUrl },
    });
    expect(card.hasUnreleasedPlatforms).toBe(true);
    expect(card.downloads.every(({ href }) => href === undefined)).toBe(true);
  });

  test("renders only planned platforms in a consistent store order without duplicates", () => {
    const card = getProductCardModel({
      ...mobileApp,
      platforms: ["ios", "android", "ios"],
      storeLinks: { web: "https://example.com", ios: iosUrl },
    });
    expect(card.downloads.map(({ label }) => label)).toEqual(["Google Play", "App Store"]);
  });
});
