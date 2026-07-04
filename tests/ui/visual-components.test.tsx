import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { DocumentPage } from "../../app/components/DocumentPage";
import { ProductLinks } from "../../app/components/ProductLinks";
import type { Product } from "../../app/content/products/types";

const product: Product = {
  status: "published",
  slug: "visual-test-product",
  name: "Visual Test Product",
  type: "mobile-app",
  shortDescription: "A product used by visual component tests.",
  platforms: ["ios", "android"],
  supportEmail: "support@example.com",
  lastUpdated: "2026-07-04",
  storeLinks: {
    ios: "https://apps.apple.com/example",
  },
  presentation: {
    overview: { mode: "standard" },
    support: { mode: "standard" },
    privacy: { mode: "generated" },
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: false,
    usesCrashReporting: false,
    hasAccounts: true,
    collectsPersonalData: true,
    requiresDataDeletionPage: true,
    thirdPartyServices: [],
  },
};

function renderWithRouter(element: React.ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

describe("visual components", () => {
  test("ProductLinks renders overview, policy, support, data deletion, and store links", () => {
    const html = renderWithRouter(createElement(ProductLinks, { product }));

    expect(html).toContain("/products/visual-test-product/");
    expect(html).toContain("/products/visual-test-product/privacy/");
    expect(html).toContain("/products/visual-test-product/support/");
    expect(html).toContain("/products/visual-test-product/data-deletion/");
    expect(html).toContain("https://apps.apple.com/example");
  });

  test("ProductLinks skips empty store links", () => {
    const html = renderWithRouter(
      createElement(ProductLinks, {
        product: {
          ...product,
          storeLinks: {
            ios: "",
            android: undefined,
            web: " https://example.com/play ",
          },
        },
      }),
    );

    expect(html).not.toContain(">ios</a>");
    expect(html).not.toContain(">android</a>");
    expect(html).toContain('href="https://example.com/play"');
    expect(html).toContain(">web</a>");
  });

  test("ProductCard includes product metadata and shared product links", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const html = renderWithRouter(createElement(ProductCard, { product }));

    expect(html).toContain("Visual Test Product");
    expect(html).toContain("mobile-app");
    expect(html).toContain("ios / android");
    expect(html).toContain("/products/visual-test-product/privacy/");
  });

  test("DocumentPage renders a calm document wrapper", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentPage, null, createElement("p", null, "Readable policy text")),
    );

    expect(html).toContain("Readable policy text");
  });
});
