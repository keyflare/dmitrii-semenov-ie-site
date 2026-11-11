import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { ProductCard } from "../../app/components/ProductCard";
import { ProductLinks } from "../../app/components/ProductLinks";
import { findPublishedProduct } from "../../app/content/products/registry";
import { getProductOverviewProduct } from "../../app/routes/product-overview";
import { getProductPrivacyProduct } from "../../app/routes/product-privacy";
import { getProductSupportProduct } from "../../app/routes/product-support";
import { getProductTermsProduct } from "../../app/routes/product-terms";
import { productSiteSources } from "../../scripts/product-site-sources";

function getRatebench() {
  const ratebench = findPublishedProduct("ratebench");
  if (!ratebench?.staticSite) {
    throw new Error("Missing published Ratebench static site");
  }
  return ratebench;
}

function renderWithRouter(element: ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

describe("Ratebench product", () => {
  test("publishes the Exchange export and retains the app catalog metadata", () => {
    expect(getRatebench()).toMatchObject({
      status: "published",
      name: "Ratebench",
      type: "mobile-app",
      platforms: ["android", "ios"],
      releaseStage: "in-development",
      supportEmail: "support@keyflare.studio",
      storeLinks: {},
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
    });
  });

  test.each([
    ["overview", getProductOverviewProduct],
    ["privacy", getProductPrivacyProduct],
    ["terms", getProductTermsProduct],
    ["support", getProductSupportProduct],
  ])("leaves %s to the imported static site", (_name, getProduct) => {
    expect(() => getProduct("ratebench")).toThrow(expect.objectContaining({ status: 404 }));
  });

  test("links to the hosted documents from the catalog", () => {
    for (const component of [ProductCard, ProductLinks]) {
      const html = renderWithRouter(createElement(component, { product: getRatebench() }));
      for (const page of ["privacy", "terms", "support"]) {
        expect(html).toContain(`href="/products/ratebench/${page}/"`);
      }
      expect(html).toContain("In development");
      expect(html).not.toContain("Android coming soon");
      expect(html).not.toContain("iOS coming soon");
    }
  });

  test("hides store links for an in-development product", () => {
    const storeUrl = "https://apps.apple.com/app/ratebench/id123456789";
    const product = { ...getRatebench(), storeLinks: { ios: storeUrl } };
    for (const component of [ProductCard, ProductLinks]) {
      const html = renderWithRouter(createElement(component, { product }));
      expect(html).not.toContain(storeUrl);
    }
  });

  test("pins the Exchange website release", () => {
    expect(productSiteSources.ratebench).toMatchObject({
      repository: "keyflare/exchange",
      tag: expect.stringMatching(/^site-v/),
      commit: expect.stringMatching(/^[0-9a-f]{40}$/),
    });
  });
});
