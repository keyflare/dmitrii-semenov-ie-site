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

  test("PageIcon renders decorative filled artwork without external assets", async () => {
    const { PageIcon } = await import("../../app/components/PageIcon");
    const contactHtml = renderToStaticMarkup(createElement(PageIcon, { name: "contact" }));
    const legalHtml = renderToStaticMarkup(createElement(PageIcon, { name: "legal" }));
    const privacyHtml = renderToStaticMarkup(createElement(PageIcon, { name: "privacy" }));

    for (const html of [contactHtml, legalHtml, privacyHtml]) {
      expect(html).toContain('viewBox="0 0 256 256"');
      expect(html).toContain('fill="currentColor"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('focusable="false"');
      expect(html).not.toContain("<image");
    }
  });

  test("PageHeader keeps headings icon-free by default", async () => {
    const { PageHeader } = await import("../../app/components/PageHeader");
    const html = renderToStaticMarkup(createElement(PageHeader, { title: "Products" }));
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(html).toContain(">Products</h1>");
    expect(html).not.toContain("data-page-icon");
    expect(html).toContain("titleNoWrap");
    expect(pageHeaderCss).toMatch(/\.titleNoWrap\s*{[^}]*white-space:\s*nowrap;/s);
  });

  test("PageHeader allows wrapping only when explicitly requested", async () => {
    const { PageHeader } = await import("../../app/components/PageHeader");
    const html = renderToStaticMarkup(
      createElement(PageHeader, { title: "Keyflare Studio", allowTitleWrap: true }),
    );
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(html).toContain("titleAllowWrap");
    expect(pageHeaderCss).toMatch(/\.titleAllowWrap\s*{[^}]*white-space:\s*normal;/s);
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

    expect(html).toContain('src="/brand/keyflare-studio-wordmark.svg"');
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

  test("ProductCard renders the shared anatomy with download actions and an overview link", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const html = renderWithRouter(createElement(ProductCard, { product }));

    expect(html).toContain("posterButton");
    expect(html).toContain("compact");
    expect(html).toContain("Visual Test Product");
    expect(html).toContain(">MOBILE APP</div>");
    expect(html).not.toContain("ios / android");
    expect(html).toContain('href="/products/visual-test-product/"');
    expect(html).toContain("Google Play");
    expect(html).toContain("App Store");
    expect(html).toContain("Coming Soon");
    expect(html).toContain("In development");
    expect(html).toContain('href="https://apps.apple.com/example"');
    expect(html).toContain('aria-label="App Store for Visual Test Product"');
    expect(html).not.toMatch(/<span[^>]+aria-label=/);
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).not.toContain("Send feedback");
    expect(html).not.toContain("/products/visual-test-product/privacy/");
    expect(html).not.toContain("/products/visual-test-product/support/");
    expect(html).not.toContain(">Overview<");
  });

  test("ProductCard shows the selected real iOS screenshot in an iPhone frame", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const paletteMaster = products.find((entry) => entry.slug === "palette-master");

    if (!paletteMaster) {
      throw new Error("Missing Palette Master product fixture");
    }

    const html = renderWithRouter(createElement(ProductCard, { product: paletteMaster }));

    expect(html).toContain('href="/products/palette-master/"');
    expect(html).toContain(">MOBILE GAME</div>");
    expect(html).not.toContain("mailto:");
    expect(html).toContain(
      "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&amp;hl=en",
    );
    expect(html).toContain("https://apps.apple.com/app/id6785084110");
    expect(html).toContain('data-store-icon="google-play"');
    expect(html).toContain('data-store-icon="app-store"');
    expect(html).not.toContain("Coming Soon");
    expect(html).not.toContain("In development");
    expect(html).not.toContain(">Overview<");
    expect(html).toContain('data-product-media="iphone"');
    expect(html).toContain('src="/media/cards/palette-master-gameplay.png"');
    expect(html).toContain('alt="Palette Master gameplay showing a scrambled color grid."');
    expect(html).toContain('width="1320" height="2868"');
    expect(html).not.toContain('data-product-placeholder="true"');
  });

  test("Home route preserves copy and published-only links in the new poster composition", async () => {
    const { default: HomeRoute } = await import("../../app/routes/home");
    const Stub = createRoutesStub([{ path: "/", Component: HomeRoute }]);
    const html = renderToStaticMarkup(createElement(Stub));

    expect(html).toContain('aria-label="Tiny apps, loud ideas."');
    expect(html).toContain("BY DMITRII SEMENOV");
    expect(html).toContain("Software for mobile, desktop, TV, and whatever comes next.");
    expect(html).toContain("View products");
    expect(html).toContain("Contact studio");
    expect(html).not.toContain('aria-label="Studio product signals"');
    expect(html).not.toContain("Apps / Games / Tools");
    expect(html).toContain("Launch board");
    const published = products.filter((entry) => entry.status === "published");
    expect(html.match(/data-product-placeholder="true"/g) ?? []).toHaveLength(
      published.filter((entry) => !entry.cardMedia).length,
    );
    expect(html.match(/data-product-media="/g) ?? []).toHaveLength(
      published.filter((entry) => entry.cardMedia).length,
    );
    for (const entry of published) {
      expect(html).toContain(`href="/products/${entry.slug}/"`);
      expect(html).toContain(entry.shortDescription);
    }
    expect(html).not.toContain("Fixture Product");
    expect(html).not.toContain("/screenshots/");
  });

  test("Studio hero keeps its composition decorative and its main actions usable without JavaScript", async () => {
    const { StudioHero } = await import("../../app/components/StudioHero");
    const html = renderWithRouter(createElement(StudioHero));
    expect(html).toContain('aria-label="Tiny apps, loud ideas."');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('data-hero-glass="true"');
    expect(html).toContain('href="/products/"');
    expect(html).toContain('href="/contact/"');
    expect(html.match(/class="[^"]+raised[^"]*"/g) ?? []).toHaveLength(2);
    expect(html).not.toContain("<canvas");
    expect(html).not.toContain("<img");
  });

  test("Document page headings stay within the readable column", () => {
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(pageHeaderCss).toMatch(
      /\.header\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
    );
    expect(pageHeaderCss).toMatch(/\.document \.titleLockup\s*\{[^}]*width:\s*100%;/s);
  });

  test("Poster page headings stay on the canvas at phone widths", () => {
    const pageHeaderCss = readFileSync("app/components/PageHeader.module.css", "utf8");

    expect(pageHeaderCss).toMatch(
      /@media \(max-width: 420px\)[\s\S]*\.poster \.title\s*\{[^}]*font-size:\s*clamp\(1\.5rem,\s*8vw,\s*2\.4rem\);/s,
    );
    expect(pageHeaderCss).toMatch(
      /@media \(max-width: 420px\)[\s\S]*\.document \.title\s*\{[^}]*font-size:\s*clamp\(1\.2rem,\s*5vw,\s*2rem\);/s,
    );
  });

  test("Catalog grid content cannot widen the page", () => {
    const globalCss = readFileSync("app/styles/global.css", "utf8");

    expect(globalCss).toMatch(
      /\.catalog-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
    );
  });

  test("Product card heading levels follow the page hierarchy", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const catalogCard = renderWithRouter(createElement(ProductCard, { product }));
    const homeCard = renderWithRouter(createElement(ProductCard, { product, headingLevel: "h3" }));
    expect(catalogCard).toMatch(/<h2[^>]*>.*?Visual Test Product.*?<\/h2>/s);
    expect(homeCard).toMatch(/<h3[^>]*>.*?Visual Test Product.*?<\/h3>/s);
  });

  test.each([
    ["palette-master", "palette-master-ios-icon.png"],
    ["ratebench", "ratebench-ios-icon.png"],
    ["wgportal", "wg-portal-tvos-icon.png"],
  ])("includes the local %s app icon in the card heading", async (slug, filename) => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const entry = products.find((item) => item.slug === slug)!;
    const html = renderWithRouter(createElement(ProductCard, { product: entry }));
    const heading = html.match(/<h2[^>]*>.*?<\/h2>/)?.[0];

    expect(heading).toContain(`src="/media/cards/${filename}"`);
    expect(heading).toContain('alt=""');
    expect(heading).toContain(`data-card-outline-copy="">${entry.name}</span>`);
  });

  test("The Ratebench card shows one released store and one upcoming store", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const ratebench = products.find((entry) => entry.slug === "ratebench")!;
    const html = renderWithRouter(createElement(ProductCard, { product: ratebench }));
    expect(html).toContain("In development");
    expect(html).not.toContain("Android / iOS");
    expect(html).toContain("Google Play");
    expect(html).toContain("App Store");
    expect(html.match(/>Coming Soon</g)).toHaveLength(1);
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).not.toContain("/products/ratebench/terms/");
    expect(html).toContain('data-product-media="iphone"');
    expect(html).toContain('src="/media/cards/ratebench-converter.png"');
    expect(html).not.toContain("apps.apple.com");
    expect(html).toContain(
      "https://play.google.com/store/apps/details?id=com.keyflare.exchange.android",
    );
  });

  test("WG Portal uses its ring illustration with the shared outline", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const wgPortal = products.find((entry) => entry.slug === "wgportal")!;
    const html = renderWithRouter(createElement(ProductCard, { product: wgPortal }));
    expect(html).toContain('data-product-media="illustration"');
    expect(html).toContain('src="/media/cards/wg-portal-ring.webp"');
    expect(html).toContain('alt="WG Portal’s luminous violet ring."');
    expect(html).not.toContain('data-product-placeholder="true"');
    expect(html.match(/data-card-outline-copy=""/g)).toHaveLength(2);
    expect(html).toContain("<canvas");
    expect(html).toContain('href="https://apps.apple.com/app/id6835040683"');
    expect(html).toContain('data-store-icon="app-store"');
  });

  test("Cards with placeholder artwork still use the shared outline", async () => {
    const { ProductCard } = await import("../../app/components/ProductCard");
    const html = renderWithRouter(createElement(ProductCard, { product }));
    expect(html).toContain('data-product-placeholder="true"');
    expect(html).not.toContain("data-product-media");
    expect(html.match(/data-card-outline-copy=""/g)).toHaveLength(2);
    expect(html).toContain("<canvas");
  });

  test("SiteShell supplies a keyboard skip link and the approved complete wordmark", async () => {
    const { SiteShell } = await import("../../app/components/SiteShell");
    const html = renderWithRouter(createElement(SiteShell, null, "Content"));
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
    expect(html).toContain('aria-label="Keyflare Studio home"');
    expect(html).toContain("/brand/keyflare-studio-wordmark.svg");
  });

  test("PosterButton keeps disabled statuses out of the keyboard tab order", async () => {
    const { PosterButton } = await import("../../app/components/PosterButton");
    const html = renderWithRouter(
      createElement(PosterButton, { tone: "disabled", children: "In development" }),
    );
    expect(html).toContain("<span");
    expect(html).not.toContain("href=");
    expect(html).not.toContain("tabindex=");
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
    expect(html).toContain("This website does not require registration.");
    expect(html).toContain("Yandex Metrica");
    expect(html).toContain("Website analytics is separate from analytics inside the apps.");
    expect(html).not.toContain("This website does not use analytics");
    expect(html).toContain("If you contact Keyflare Studio by email");
    expect(html).toContain("Product Privacy Policies");

    const publishedProducts = products.filter((product) => product.status === "published");
    const productPrivacyLinks = html.match(/href="\/products\/[^"]+\/privacy\/"/g)?.length ?? 0;

    expect(productPrivacyLinks).toBe(publishedProducts.length);

    for (const publishedProduct of publishedProducts) {
      expect(html).toContain(`href="/products/${publishedProduct.slug}/privacy/"`);
      expect(html).toContain(`${publishedProduct.name} Privacy Policy`);
    }

    expect(html).toContain("Last updated: November 23, 2026");
  });
});
