import { describe, expect, test } from "vitest";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import {
  findPublishedProduct,
  getPrerenderPaths,
  products,
} from "../../app/content/products/registry";
import { validateProducts } from "../../app/content/products/validate";

function getRatebench() {
  const ratebench = products.find((product) => product.slug === "ratebench");

  if (!ratebench) {
    throw new Error("Missing Ratebench test product");
  }

  return ratebench;
}

describe("Ratebench product", () => {
  test("is published as an in-development Android and iOS subscription app", () => {
    expect(getRatebench()).toMatchObject({
      status: "published",
      slug: "ratebench",
      name: "Ratebench",
      type: "mobile-app",
      platforms: ["android", "ios"],
      releaseStage: "in-development",
      supportEmail: "support@keyflare.studio",
      storeLinks: {},
      presentation: {
        overview: { mode: "custom", componentKey: "ratebench" },
        privacy: { mode: "mdx", contentKey: "ratebench-privacy" },
        terms: { mode: "mdx", contentKey: "ratebench-terms" },
        support: { mode: "mdx", contentKey: "ratebench-support" },
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
    });

    expect(findPublishedProduct("ratebench")).toEqual(
      expect.objectContaining({ slug: "ratebench" }),
    );
  });

  test("registers the custom overview and document content", () => {
    expect(customProductOverviewPages).toHaveProperty("ratebench");
    expect(productMdxContent).toHaveProperty("ratebench-privacy");
    expect(productMdxContent).toHaveProperty("ratebench-terms");
    expect(productMdxContent).toHaveProperty("ratebench-support");
  });

  test("prerenders every Ratebench public page", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining([
        "/products/ratebench",
        "/products/ratebench/privacy",
        "/products/ratebench/terms",
        "/products/ratebench/support",
      ]),
    );
    expect(getPrerenderPaths()).not.toContain("/products/ratebench/data-deletion");
  });

  test("passes published product validation", () => {
    expect(validateProducts(products)).toEqual([]);
  });
});
