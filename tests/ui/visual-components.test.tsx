import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoutesStub, MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { DocumentPage } from "../../app/components/DocumentPage";
import { ProductLinks } from "../../app/components/ProductLinks";
import { products } from "../../app/content/products/registry";
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
  test("SiteShell uses the studio logo asset in the header brand", async () => {
    const { SiteShell } = await import("../../app/components/SiteShell");
    const html = renderWithRouter(
      createElement(SiteShell, null, createElement("p", null, "Shell content")),
    );

    expect(html).toContain('src="/brand/keyflare-studio-logo.svg"');
    expect(html).toContain('alt=""');
    expect(html).toContain(">Keyflare Studio</span>");
    expect(html).not.toContain(">KEYFLARE STUDIO</span>");
    expect(html).toContain("_plain_");
    expect(html).not.toContain("_framed_");
    expect(html).not.toContain(">K</span>");
  });

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
    expect(html).toContain(">Web</a>");
  });

  test("ProductLinks renders platforms without store links as coming soon", () => {
    const html = renderWithRouter(
      createElement(ProductLinks, {
        product: {
          ...product,
          storeLinks: {
            android: "https://play.google.com/store/apps/details?id=example",
          },
        },
      }),
    );

    expect(html).toContain(">Android</a>");
    expect(html).toContain("iOS coming soon");
  });

  test("ProductCard includes product metadata and shared product links", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const html = renderWithRouter(createElement(ProductCard, { product }));

    expect(html).toContain("Visual Test Product");
    expect(html).toContain("mobile-app");
    expect(html).toContain("ios / android");
    expect(html).toContain('href="/products/visual-test-product/"');
    expect(html).toContain("Send feedback");
    expect(html).toContain("/products/visual-test-product/privacy/");
    expect(html).toContain("/products/visual-test-product/support/");
    expect(html).not.toContain(">Overview<");
  });

  test("ProductCard makes Palette Master card clickable and shows a product preview", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const paletteMaster = products.find((entry) => entry.slug === "palette-master");

    if (!paletteMaster) {
      throw new Error("Missing Palette Master product fixture");
    }

    const html = renderWithRouter(createElement(ProductCard, { product: paletteMaster }));

    expect(html).toContain('href="/products/palette-master/"');
    expect(html).toContain("mailto:semdm.am@gmail.com?subject=Palette%20Master%20feedback");
    expect(html).toContain("/products/palette-master/privacy/");
    expect(html).toContain("/products/palette-master/support/");
    expect(html).toContain(
      "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&amp;hl=en",
    );
    expect(html).toContain("/products/palette-master/store-icons/google-play.svg");
    expect(html).toContain("/products/palette-master/store-icons/app-store.svg");
    expect(html).toContain("iOS coming soon");
    expect(html).not.toContain(">Overview<");
    expect(html).toContain("/products/palette-master/screenshots/palette-master-03.png");
    expect(html).toContain("Palette Master gameplay preview");
  });

  test("Home route shows published products on the launch board", async () => {
    const { default: HomeRoute } = await import("../../app/routes/home");
    const Stub = createRoutesStub([{ path: "/", Component: HomeRoute }]);
    const html = renderToStaticMarkup(createElement(Stub));

    expect(html).toContain('src="/brand/keyflare-studio-logo-rect.svg"');
    expect(html).toContain("home-title-keyflare-line");
    expect(html).toContain("home-title-keyflare-stem");
    expect(html).toContain("home-title-keyflare-tail");
    expect(html).toContain("home-title-second-line");
    expect(html).toContain("home-title-studio-word");
    expect(html).toContain("home-title-logo");
    expect(html).toContain("titleLockup");
    expect(html).toContain("eyebrowEnd");
    expect(html).toContain("BY DMITRII SEMENOV");
    expect(html).not.toContain("Independent software studio");
    expect(html).toContain("home-poster-title-token");
    expect(html).toContain("Apps /</span>");
    expect(html).toContain("Games /</span>");
    expect(html).not.toContain("home-title-studio-line");
    expect(html).not.toContain("home-title-lockup");
    expect(html).not.toContain("home-studio-logo");
    expect(html).toContain("Launch board");
    expect(html).toContain("Palette Master");
    expect(html).toContain('href="/products/palette-master/"');
    expect(html).not.toContain("Published products appear here with store-safe links.");
  });

  test("Home title logo behaves like a baseline-aligned inline symbol", () => {
    const globalCss = readFileSync("app/styles/global.css", "utf8");
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(globalCss).toContain("vertical-align: baseline;");
    expect(globalCss).toContain("font-size: clamp(2.4rem, 6.25vw, 5rem);");
    expect(globalCss).toContain("gap: calc(var(--space-8) / 3);");
    expect(globalCss).toContain("@media (min-width: 1400px)");
    expect(globalCss).toContain("grid-template-columns: minmax(0, 0.735fr) minmax(26rem, 0.58fr);");
    expect(globalCss).toContain("align-items: flex-end;");
    expect(globalCss).toContain("gap: 0;");
    expect(globalCss).toContain("justify-content: space-between;");
    expect(globalCss).toContain("overflow-wrap: anywhere;");
    expect(globalCss).toContain("font-size: clamp(1.7rem, 4.25vw, 3.4rem);");
    expect(globalCss).toContain(".home-poster-title-token");
    expect(globalCss).toContain("white-space: nowrap;");
    expect(globalCss).toContain("@media (max-width: 1100px)");
    expect(globalCss).not.toContain("drop-shadow(0.3rem 0.3rem 0 rgb(21 17 28 / 14%))");
    expect(pageHeaderCss).toContain("gap: var(--space-1);");
    expect(pageHeaderCss).toContain(".titleLockup");
    expect(pageHeaderCss).toContain("width: max-content;");
    expect(pageHeaderCss).toContain("max-width: 100%;");
    expect(pageHeaderCss).toContain("transform: translateY(var(--page-header-eyebrow-drop, 0));");
    expect(pageHeaderCss).toContain(".poster .description");
    expect(pageHeaderCss).toContain("margin-top: var(--space-1);");
  });

  test("SiteShell header brand is mixed case, larger, and unframed", () => {
    const siteShellCss = readFileSync("app/components/SiteShell.module.css", "utf8");

    expect(siteShellCss).toContain(".brandName");
    expect(siteShellCss).toContain("--studio-logo-size: 2.3rem;");
    expect(siteShellCss).toContain("transform: translateY(-0.12rem);");
    expect(siteShellCss).toContain("font-size: 1.275rem;");
    expect(siteShellCss).not.toContain("text-transform: uppercase;");
  });

  test("DocumentPage renders a calm document wrapper", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentPage, null, createElement("p", null, "Readable policy text")),
    );

    expect(html).toContain("Readable policy text");
  });
});
