import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { ProductCard } from "../../app/components/ProductCard";
import { ProductLinks } from "../../app/components/ProductLinks";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import {
  findPublishedProduct,
  getPrerenderPaths,
  products,
} from "../../app/content/products/registry";
import { validateProducts } from "../../app/content/products/validate";
import { ProductOverviewContent } from "../../app/routes/product-overview";
import { ProductPrivacyContent } from "../../app/routes/product-privacy";
import { ProductSupportContent } from "../../app/routes/product-support";
import { ProductTermsContent } from "../../app/routes/product-terms";

function getRatebench() {
  const ratebench = products.find((product) => product.slug === "ratebench");

  if (!ratebench) {
    throw new Error("Missing Ratebench test product");
  }

  return ratebench;
}

function renderWithRouter(element: ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
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

  test("renders the Studio Ledger overview and product links", () => {
    const html = renderWithRouter(
      createElement(ProductOverviewContent, { product: getRatebench() }),
    );

    expect(html).toContain("In development");
    expect(html).toContain("Compare every step.");
    expect(html).toContain("Fiat &amp; crypto");
    expect(html).toContain("Multi-step calculations");
    expect(html).toContain("Local history");
    expect(html).toContain("not a financial institution");
    expect(html).toContain("/products/ratebench/privacy/");
    expect(html).toContain("/products/ratebench/terms/");
    expect(html).toContain("/products/ratebench/support/");
    expect(html).toContain("/products/ratebench/ratebench-logo.svg");
    expect(html).not.toContain("Android coming soon");
    expect(html).not.toContain("iOS coming soon");
  });

  test("renders one in-development status in shared product navigation", () => {
    const cardHtml = renderWithRouter(createElement(ProductCard, { product: getRatebench() }));
    const linksHtml = renderWithRouter(createElement(ProductLinks, { product: getRatebench() }));

    for (const html of [cardHtml, linksHtml]) {
      expect(html).toContain("In development");
      expect(html).toContain("/products/ratebench/terms/");
      expect(html).not.toContain("Android coming soon");
      expect(html).not.toContain("iOS coming soon");
    }
  });

  test("provides the product Terms document renderer", async () => {
    const termsRoute = await import("../../app/routes/product-terms");

    expect(termsRoute.ProductTermsContent).toBeTypeOf("function");
  });

  test("renders factual Privacy, Terms, and Support documents without drafting placeholders", () => {
    const product = getRatebench();
    const privacyHtml = renderWithRouter(createElement(ProductPrivacyContent, { product }));
    const termsHtml = renderWithRouter(createElement(ProductTermsContent, { product }));
    const supportHtml = renderWithRouter(createElement(ProductSupportContent, { product }));

    expect(privacyHtml).toContain("Information stored on your device");
    expect(privacyHtml).toContain("AppMetrica");
    expect(privacyHtml).toContain("Apple");
    expect(privacyHtml).toContain("Google");
    expect(privacyHtml).toContain("payment card");
    expect(privacyHtml).toContain("July 26, 2026");

    expect(termsHtml).toContain("Important financial disclaimer");
    expect(termsHtml).toContain("Subscriptions and billing");
    expect(termsHtml).toContain("automatically renew");
    expect(termsHtml).toContain("July 26, 2026");

    expect(supportHtml).toContain("Restore purchases");
    expect(supportHtml).toContain("In development");
    expect(supportHtml).toContain("/products/ratebench/privacy/");
    expect(supportHtml).toContain("/products/ratebench/terms/");

    for (const html of [privacyHtml, termsHtml, supportHtml]) {
      expect(html).not.toMatch(/\[(?:[A-Z][A-Z _-]+)\]/);
      expect(html).not.toContain("Drafting note");
    }
  });
});
