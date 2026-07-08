import { createElement, type ReactElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import {
  findPublishedProduct,
  getPrerenderPaths,
  getPublishedProducts,
  products,
} from "../../app/content/products/registry";
import type { Product } from "../../app/content/products/types";
import { getProductDataDeletionProduct } from "../../app/routes/product-data-deletion";
import {
  getProductOverviewProduct,
  ProductOverviewContent,
} from "../../app/routes/product-overview";
import { getProductPrivacyProduct, ProductPrivacyContent } from "../../app/routes/product-privacy";
import { getProductSupportProduct, ProductSupportContent } from "../../app/routes/product-support";

const paletteMasterOverviewSource = readFileSync(
  new URL("../../app/content/products/palette-master/Overview.tsx", import.meta.url),
  "utf8",
);

function getRegistryProduct(slug: string): Product {
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    throw new Error(`Missing test product: ${slug}`);
  }

  return product;
}

function expectRoute404(getRouteProduct: (slug: string) => unknown, slug: string) {
  let thrown: unknown;

  try {
    getRouteProduct(slug);
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(Response);
  expect((thrown as Response).status).toBe(404);
}

function renderWithRouter(element: ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

describe("product customization", () => {
  test("standard fixture product uses the standard presentation", () => {
    const fixtureProduct = products.find((product) => product.slug === "fixture-product");

    expect(fixtureProduct?.presentation).toEqual({
      overview: { mode: "standard" },
      support: { mode: "standard" },
      privacy: { mode: "generated" },
    });
  });

  test("custom overview registry contains Palette Master", () => {
    expect(customProductOverviewPages).toHaveProperty("palette-master");
  });

  test("MDX content registry contains Palette Master content sections", () => {
    expect(productMdxContent).toHaveProperty("palette-master-overview");
    expect(productMdxContent).toHaveProperty("palette-master-support");
    expect(productMdxContent).toHaveProperty("palette-master-privacy");
  });

  test("Palette Master is published with Android availability and iOS coming soon", () => {
    const paletteMaster = products.find((product) => product.slug === "palette-master");

    expect(paletteMaster).toMatchObject({
      status: "published",
      type: "mobile-game",
      platforms: ["android", "ios"],
      supportEmail: "support@keyflare.studio",
      storeLinks: {
        android: "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&hl=en",
      },
      privacyProfile: {
        usesAdMob: true,
        usesAnalytics: true,
        usesCrashReporting: true,
        hasAccounts: false,
        collectsPersonalData: true,
        requiresDataDeletionPage: false,
        thirdPartyServices: ["Google AdMob", "Google User Messaging Platform", "AppMetrica"],
      },
    });
    expect(getPublishedProducts()).toContainEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
  });

  test("published Palette Master appears in public product paths without data deletion", () => {
    expect(findPublishedProduct("palette-master")).toEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
    expect(getPrerenderPaths()).toContain("/products/palette-master");
    expect(getPrerenderPaths()).toContain("/products/palette-master/privacy");
    expect(getPrerenderPaths()).toContain("/products/palette-master/support");
    expect(getPrerenderPaths()).not.toContain("/products/palette-master/data-deletion");
  });

  test("published Palette Master resolves through public overview, privacy, and support routes", () => {
    expect(getProductOverviewProduct("palette-master")).toEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
    expect(getProductPrivacyProduct("palette-master")).toEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
    expect(getProductSupportProduct("palette-master")).toEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
    expectRoute404(getProductDataDeletionProduct, "palette-master");
  });

  test("renders a custom overview component when configured", () => {
    const html = renderWithRouter(
      createElement(ProductOverviewContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toContain("offline color puzzle game");
    expect(html).toContain("Available now");
    expect(html).toContain("/products/palette-master/store-icons/google-play.svg");
    expect(html).toContain("Android · Google Play");
    expect(html).toContain("Coming soon");
    expect(html).toContain("/products/palette-master/store-icons/app-store.svg");
    expect(html).toContain("iOS · App Store");
    expect(html).toContain("200+ levels");
    expect(html).toContain("No timers");
    expect(html).toContain("mailto:support@keyflare.studio?subject=Palette%20Master%20feedback");
    expect(html).toContain("/products/palette-master/screenshots/palette-master-03");
    expect(html).toContain('aria-label="Previous screenshot"');
    expect(html).toContain('aria-label="Next screenshot"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("1 / 6");
    expect(html).toContain("carouselFrame");
    expect(html).toContain("edgeFade");
    expect(html).toContain("/products/palette-master/privacy/");
    expect(html).toContain("/products/palette-master/support/");
    expect(html).toMatch(
      /<nav[^>]+aria-label="Palette Master links"[^>]*><a[^>]+>Send feedback<\/a>/,
    );
    expect(html).not.toContain(
      'href="/products/palette-master/" data-discover="true">Overview</a>',
    );
    expect(html).not.toContain(">Android</a>");
    expect(html).not.toContain("iOS coming soon</span>");
    expect(html).not.toContain("Get it on Android");
  });

  test("keeps the Palette Master screenshot carousel paced and scoped to one slide", () => {
    expect(paletteMasterOverviewSource).toContain("const carouselIntervalMs = 2000");
    expect(paletteMasterOverviewSource).toContain("track.scrollTo({");
    expect(paletteMasterOverviewSource).toContain("target.offsetLeft - firstScreenshot.offsetLeft");
    expect(paletteMasterOverviewSource).toContain("restartCarouselAutoplay");
    expect(paletteMasterOverviewSource).toContain("handleCarouselControl");
    expect(paletteMasterOverviewSource).toContain("lastCarouselInteractionAtRef");
    expect(paletteMasterOverviewSource).not.toContain('addEventListener("scroll"');
    expect(paletteMasterOverviewSource).not.toContain("scrollIntoView({");
  });

  test("renders standard overview with appended MDX content when configured", () => {
    const product: Product = {
      ...getRegistryProduct("palette-master"),
      slug: "palette-master-standard",
      presentation: {
        overview: { mode: "standard-with-mdx", contentKey: "palette-master-overview" },
        support: { mode: "standard" },
        privacy: { mode: "generated" },
      },
    };

    const html = renderWithRouter(createElement(ProductOverviewContent, { product }));

    expect(html).toContain("Type:");
    expect(html).toContain("Gameplay");
  });

  test("renders support MDX content when configured", () => {
    const html = renderWithRouter(
      createElement(ProductSupportContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toContain("Email:");
    expect(html).toMatch(/<article class="[^"]*document[^"]*">/);
    expect(html).toMatch(/<h2 class="[^"]*heading2[^"]*">Feedback and Support<\/h2>/);
    expect(html).toContain("Palette%20Master%20feedback");
    expect(html).toContain("Android device model");
  });

  test("renders the full Palette Master privacy policy from MDX", () => {
    const html = renderWithRouter(
      createElement(ProductPrivacyContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toMatch(/<article class="[^"]*document[^"]*">/);
    expect(html).toContain("July 8, 2026");
    expect(html).toContain("<footer>Last updated: July 8, 2026</footer>");
    expect(html).not.toContain("<strong>Last updated:</strong>");
    expect(html).toContain("support@keyflare.studio");
    expect(html).toContain("Gameplay and app usage data");
    expect(html).toContain("AppMetrica");
    expect(html).toContain("Google User Messaging Platform");
    expect(html).toContain("Options");
    expect(html).toMatch(/Privacy\s+choices/);
    expect(html).toContain("We do not sell your personal information for money.");
    expect(html).not.toContain(
      "This product is configured as not collecting personal data directly.",
    );
    expect(html).not.toContain("Palette Master Notes");
  });
});
