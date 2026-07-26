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
    usesSubscriptions: false,
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
  test("root links declare the square studio logo as an SVG favicon", async () => {
    const { links } = await import("../../app/root");

    expect(links()).toEqual(
      expect.arrayContaining([
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/brand/keyflare-studio-logo.svg",
        },
      ]),
    );
  });

  test("PageHeader renders an optional decorative page icon", async () => {
    const { PageHeader } = await import("../../app/components/PageHeader");
    const { PageIcon } = await import("../../app/components/PageIcon");
    const html = renderToStaticMarkup(
      createElement(PageHeader, {
        title: "Contact",
        variant: "document",
        icon: createElement(PageIcon, { name: "contact" }),
      }),
    );

    expect(html).toContain('data-page-icon="contact"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain("<h1");
    expect(html).toContain("Contact</span></h1>");
  });

  test("PageIcon uses the supplied filled SVG artwork", async () => {
    const { PageIcon } = await import("../../app/components/PageIcon");
    const contactHtml = renderToStaticMarkup(createElement(PageIcon, { name: "contact" }));
    const legalHtml = renderToStaticMarkup(createElement(PageIcon, { name: "legal" }));
    const privacyHtml = renderToStaticMarkup(createElement(PageIcon, { name: "privacy" }));

    for (const html of [contactHtml, legalHtml, privacyHtml]) {
      expect(html).toContain('viewBox="0 -960 960 960"');
      expect(html).toContain('fill="currentColor"');
      expect(html).not.toContain("stroke=");
    }
    expect(contactHtml).toContain('d="M480-480Zm0-40 320-200H160l320 200Z');
    expect(legalHtml).toContain('d="M160-120v-80h480v80H160Z');
    expect(privacyHtml).toContain('d="M480-80q-139-35-229.5-159.5T160-516');
  });

  test("PageHeader keeps headings icon-free by default", async () => {
    const { PageHeader } = await import("../../app/components/PageHeader");
    const html = renderToStaticMarkup(createElement(PageHeader, { title: "Products" }));

    expect(html).toContain(">Products</h1>");
    expect(html).not.toContain("data-page-icon");
  });

  test("PageHeader constrains icon title lockups at narrow widths", async () => {
    const { PageHeader } = await import("../../app/components/PageHeader");
    const { PageIcon } = await import("../../app/components/PageIcon");
    const html = renderToStaticMarkup(
      createElement(PageHeader, {
        title: "Website Privacy Policy",
        variant: "document",
        icon: createElement(PageIcon, { name: "privacy" }),
      }),
    );
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");
    const globalCss = readFileSync("app/styles/global.css", "utf8");

    expect(html).toContain("titleLockupWithIcon");
    expect(pageHeaderCss).toMatch(/\.titleLockupWithIcon\s*{[^}]*width: 100%;/);
    expect(pageHeaderCss).toMatch(/\.titleWithIcon\s*{[^}]*display: flex;/);
    expect(pageHeaderCss).toMatch(/\.titleText\s*{[^}]*min-width: 0;/);
    expect(globalCss).toMatch(/h1,\s*h2,\s*h3,\s*p\s*{[^}]*overflow-wrap: anywhere;/);
  });

  test("SiteShell uses the studio logo asset in the header brand", async () => {
    const { SiteShell } = await import("../../app/components/SiteShell");
    const html = renderWithRouter(
      createElement(SiteShell, null, createElement("p", null, "Shell content")),
    );

    expect(html).toContain('src="/brand/keyflare-studio-logo.svg"');
    expect(html).toContain('alt=""');
    expect(html).toContain(">Keyflare Studio</span>");
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain("Software for mobile, desktop, TV, and whatever comes next.");
    expect(html).toContain("© 2026 Keyflare Studio.");
    expect(html).toContain("Operated by Dmitrii Semenov, IE.");
    expect(html).toContain("Republic of Armenia.");
    expect(html).not.toContain("Independent software products for mobile, desktop");
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

    expect(html).toContain("posterButton");
    expect(html).toContain("compact");
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
    expect(html).toContain("mailto:support@keyflare.studio?subject=Palette%20Master%20feedback");
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

    expect(html).toContain("posterButton");
    expect(html).toContain("hero");
    expect(html).toContain("primary");
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
    expect(globalCss).toContain("--home-title-font-size: clamp(2.4rem, 6.25vw, 5rem);");
    expect(globalCss).toContain("--page-header-eyebrow-drop: var(--home-title-font-size);");
    expect(globalCss).toContain("font-size: var(--home-title-font-size);");
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
    expect(globalCss).toContain("row-gap: var(--space-8);");
    expect(globalCss).toContain("--home-title-font-size: clamp(1.7rem, 9vw, 2.4rem);");
    expect(globalCss).not.toContain("--page-header-eyebrow-drop: 0.875rem;");
    expect(globalCss).not.toContain("drop-shadow(0.3rem 0.3rem 0 rgb(21 17 28 / 14%))");
    expect(pageHeaderCss).toContain("gap: var(--space-1);");
    expect(pageHeaderCss).toContain(".titleLockup");
    expect(pageHeaderCss).toContain("width: max-content;");
    expect(pageHeaderCss).toContain("max-width: 100%;");
    expect(pageHeaderCss).toContain("transform: translateY(var(--page-header-eyebrow-drop, 0));");
    expect(pageHeaderCss).toContain(".poster .description");
    expect(pageHeaderCss).toContain("margin-top: var(--space-1);");
  });

  test("Document page headings stay within the readable column", () => {
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(pageHeaderCss).toMatch(
      /\.header\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
    );
    expect(pageHeaderCss).toMatch(/\.document \.titleLockup\s*\{[^}]*width:\s*100%;/s);
  });

  test("Catalog grid content cannot widen the page", () => {
    const globalCss = readFileSync("app/styles/global.css", "utf8");

    expect(globalCss).toMatch(
      /\.catalog-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
    );
  });

  test("Product grids stack before cards become cramped and keep launch board spacing", () => {
    const globalCss = readFileSync("app/styles/global.css", "utf8");
    const productCardCss = readFileSync("app/components/ProductCard.module.css", "utf8");

    expect(globalCss).toMatch(/\.home-products-grid\s*{[^}]*gap:\s*var\(--space-6\);/s);
    expect(globalCss).toMatch(
      /@media \(max-width: 1050px\)\s*{\s*\.catalog-grid\s*{[^}]*grid-template-columns:\s*1fr;/s,
    );
    expect(productCardCss).toMatch(
      /@media \(max-width: 860px\)\s*{\s*\.card\s*{[^}]*grid-template-columns:\s*1fr;/s,
    );
  });

  test("SiteShell header brand is mixed case, larger, and unframed", () => {
    const siteShellCss = readFileSync("app/components/SiteShell.module.css", "utf8");

    expect(siteShellCss).toContain(".brandName");
    expect(siteShellCss).toContain("--studio-logo-size: 2.3rem;");
    expect(siteShellCss).toContain("transform: translateY(-0.12rem);");
    expect(siteShellCss).toContain("font-size: 1.275rem;");
    expect(siteShellCss).toMatch(/\.footerContent\s*{[^}]*align-items: center;/);
    expect(siteShellCss).not.toContain("text-transform: uppercase;");
  });

  test("PosterButton provides the shared pressed hover treatment", () => {
    const posterButtonCss = readFileSync("app/components/PosterButton.module.css", "utf8");

    expect(posterButtonCss).toContain(".posterButton");
    expect(posterButtonCss).toContain(".hero");
    expect(posterButtonCss).toContain(".compact");
    expect(posterButtonCss).toContain(".interactive:hover");
    expect(posterButtonCss).toContain("transform: translate(0.08rem, 0.08rem);");
    expect(posterButtonCss).toContain("box-shadow: var(--poster-button-hover-shadow);");
  });

  test("DocumentPage renders a calm document wrapper", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentPage, null, createElement("p", null, "Readable policy text")),
    );

    expect(html).toContain("Readable policy text");
  });

  test("Contact route renders its page icon", async () => {
    const { default: ContactRoute } = await import("../../app/routes/contact");
    const Stub = createRoutesStub([{ path: "/", Component: ContactRoute }]);
    const html = renderToStaticMarkup(createElement(Stub));

    expect(html).toContain('data-page-icon="contact"');
    expect(html).toContain('href="mailto:contact@keyflare.studio"');
  });

  test("Legal route renders the studio legal profile", async () => {
    const { default: LegalRoute } = await import("../../app/routes/legal");
    const Stub = createRoutesStub([{ path: "/", Component: LegalRoute }]);
    const html = renderToStaticMarkup(createElement(Stub));

    expect(html).toContain('data-page-icon="legal"');
    expect(html).toContain("Business Information");
    expect(html).toContain("Keyflare Studio is an independent software development");
    expect(html).toContain("Legal Entity");
    expect(html).toContain("<dt>Legal entity</dt>");
    expect(html).toContain("<dd>Dmitrii Semenov, IE</dd>");
    expect(html).toContain("<dt>Business type</dt>");
    expect(html).toContain("<dd>Individual Entrepreneur (IE)</dd>");
    expect(html).toContain("<dt>Country of registration</dt>");
    expect(html).toContain("<dd>Republic of Armenia</dd>");
    expect(html).toContain("Keyflare Studio is the public business brand of Dmitrii Semenov, IE.");
    expect(html).toContain('href="mailto:contact@keyflare.studio"');
    expect(html).toContain(
      "Business registration information is available upon legitimate request",
    );
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain("Last updated: July 2026");
  });

  test("Privacy route renders website privacy and product policy index", async () => {
    const { default: PrivacyRoute } = await import("../../app/routes/privacy");
    const Stub = createRoutesStub([{ path: "/", Component: PrivacyRoute }]);
    const html = renderToStaticMarkup(createElement(Stub));

    expect(html).toContain('data-page-icon="privacy"');
    expect(html).toContain("Website Privacy Policy");
    expect(html).toContain(
      "This website does not require user registration and does not intentionally collect personal information.",
    );
    expect(html).toContain("This website does not use analytics");
    expect(html).toContain("If you contact Keyflare Studio by email");
    expect(html).toContain("Product Privacy Policies");
    expect(html).toContain('href="/products/palette-master/privacy/"');
    expect(html).toContain("Palette Master Privacy Policy");
    expect(html).toContain("Last updated: July 2026");
  });
});
