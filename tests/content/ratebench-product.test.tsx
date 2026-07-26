import { readFileSync } from "node:fs";
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

const ratebenchOverviewCss = readFileSync(
  new URL("../../app/content/products/ratebench/Overview.module.css", import.meta.url),
  "utf8",
);

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
      theme: {
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

  test("uses the ledger page surface across Ratebench routes", () => {
    const product = getRatebench();
    const pages = [
      renderWithRouter(createElement(ProductOverviewContent, { product })),
      renderWithRouter(createElement(ProductPrivacyContent, { product })),
      renderWithRouter(createElement(ProductTermsContent, { product })),
      renderWithRouter(createElement(ProductSupportContent, { product })),
    ];

    for (const html of pages) {
      expect(html).toContain('data-page-surface="ledger"');
    }
  });

  test("renders the Studio Ledger overview and product links", () => {
    const html = renderWithRouter(
      createElement(ProductOverviewContent, { product: getRatebench() }),
    );

    expect(html).toContain("In development");
    expect(html).toMatch(/<h1[^>]*>Ratebench<\/h1>/);
    expect(html).toContain("Compare every step.");
    expect(html).toContain("USD → EUR → USDT");
    expect(html).toContain("Market");
    expect(html).toContain("Effective");
    expect(html).toContain("USD / EUR");
    expect(html).toContain("EUR / USDT");
    expect(html).toContain("Whole route");
    expect(html).toContain("USD / USDT");
    expect(html).toContain("<table");
    expect(html).toContain("<caption");
    expect(html.match(/scope="col"/g)).toHaveLength(3);
    expect(html.match(/scope="row"/g)).toHaveLength(3);
    expect(html).not.toContain(">Sent<");
    expect(html).not.toContain("Effective result");
    expect(html).toContain("Fiat &amp; crypto");
    expect(html).toContain("Multi-step calculations");
    expect(html).toContain("Local history");
    expect(html).toContain("not a financial institution");
    expect(html).toContain("/products/ratebench/privacy/");
    expect(html).toContain("/products/ratebench/terms/");
    expect(html).toContain("/products/ratebench/support/");
    expect(html).toContain("/products/ratebench/ratebench-logo.svg");
    expect(html).toContain('alt=""');
    expect(html).not.toContain("Android coming soon");
    expect(html).not.toContain("iOS coming soon");
  });

  test("uses accessible text variants for Ratebench accent colors", () => {
    expect(ratebenchOverviewCss).toContain("--ratebench-blue-text: #064fbf;");
    expect(ratebenchOverviewCss).toContain("--ratebench-blue-on-dark: #78a8ff;");
    expect(ratebenchOverviewCss).toContain("--ratebench-green-text: #267a00;");
  });

  test("keeps the mobile display title legible without splitting words", () => {
    expect(ratebenchOverviewCss).toMatch(
      /\.title\s*\{[^}]*overflow-wrap:\s*normal;[^}]*word-break:\s*normal;/s,
    );
    expect(ratebenchOverviewCss).toContain("font-size: clamp(2.8rem, 4vw, 4rem);");
    expect(ratebenchOverviewCss).toContain("font-size: clamp(1.7rem, 7.2vw, 2rem);");
    expect(ratebenchOverviewCss).toMatch(
      /@media \(max-width: 620px\)[\s\S]*\.productIdentity\s*\{[^}]*flex-direction:\s*column;[^}]*align-items:\s*flex-start;/s,
    );
    expect(ratebenchOverviewCss).toMatch(/\.heroCopy\s*\{[^}]*min-width:\s*0;/s);
    expect(ratebenchOverviewCss).toMatch(/\.ledger\s*\{[^}]*min-width:\s*0;/s);
  });

  test("stacks the benchmark before the hero identity can overlap it", () => {
    expect(ratebenchOverviewCss).toMatch(
      /@media \(max-width: 1180px\)\s*\{\s*\.hero\s*\{[^}]*grid-template-columns:\s*1fr;/s,
    );
  });

  test("uses a compact single-column financial disclaimer", () => {
    const html = renderWithRouter(
      createElement(ProductOverviewContent, { product: getRatebench() }),
    );

    expect(html).toContain("Important");
    expect(html).toContain("Reference only");
    expect(html).toContain("Reference, not advice");
    expect(ratebenchOverviewCss).not.toContain(
      "grid-template-columns: minmax(6rem, 0.28fr) minmax(0, 1fr);",
    );
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

  test("never renders store links for an in-development product", () => {
    const productWithConflictingStoreLink = {
      ...getRatebench(),
      storeLinks: {
        ios: "https://apps.apple.com/app/ratebench/id123456789",
      },
    };
    const cardHtml = renderWithRouter(
      createElement(ProductCard, { product: productWithConflictingStoreLink }),
    );
    const linksHtml = renderWithRouter(
      createElement(ProductLinks, { product: productWithConflictingStoreLink }),
    );

    for (const html of [cardHtml, linksHtml]) {
      expect(html).not.toContain("https://apps.apple.com/app/ratebench/id123456789");
      expect(html).toContain("In development");
    }
  });

  test("provides the product Terms document renderer", async () => {
    const termsRoute = await import("../../app/routes/product-terms");

    expect(termsRoute.ProductTermsContent).toBeTypeOf("function");
  });

  test("renders one page-level heading per legal document", () => {
    const product = getRatebench();
    const privacyHtml = renderWithRouter(createElement(ProductPrivacyContent, { product }));
    const termsHtml = renderWithRouter(createElement(ProductTermsContent, { product }));

    expect(privacyHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(termsHtml.match(/<h1\b/g)).toHaveLength(1);
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
    expect(
      supportHtml.match(/<a[^>]+href="mailto:support@keyflare\.studio[^"]*"[^>]*>/g),
    ).toHaveLength(1);
    expect(supportHtml.match(/\/products\/ratebench\/privacy\//g)).toHaveLength(1);
    expect(supportHtml.match(/\/products\/ratebench\/terms\//g)).toHaveLength(1);

    for (const html of [privacyHtml, termsHtml, supportHtml]) {
      expect(html).not.toMatch(/\[(?:[A-Z][A-Z _-]+)\]/);
      expect(html).not.toContain("Drafting note");
    }
  });
});
