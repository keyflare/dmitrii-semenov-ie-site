import { existsSync, readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
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

const exportRoot = new URL("../../product-sites/ratebench/", import.meta.url);
const publicUrl = "https://www.keyflare.studio/products/ratebench/";

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
        repository: "keyflare/exchange",
        revision: expect.stringMatching(/^[0-9a-f]{40}$/),
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

  test.each([
    ["", "Ratebench", ["Compare every step.", "USD → EUR → USDT", "Reference, not advice"]],
    [
      "privacy/",
      "Ratebench Privacy Policy",
      ["Information stored on your device", "AppMetrica", "payment card", "July 26, 2026"],
    ],
    [
      "terms/",
      "Ratebench Terms of Service",
      ["Important financial disclaimer", "Subscriptions and billing", "July 26, 2026"],
    ],
    ["support/", "Ratebench Support", ["Restore purchases", "In development"]],
  ])("ships a complete standalone HTML page at %s", (path, heading, content) => {
    const url = new URL(path, publicUrl);
    const html = readFileSync(new URL(`${path}index.html`, exportRoot), "utf8");
    const dom = new JSDOM(html, { url: url.href });
    const document = dom.window.document;

    expect(document.querySelector("link[rel=canonical]")?.getAttribute("href")).toBe(url.href);
    expect([...document.querySelectorAll("h1")].map((element) => element.textContent)).toEqual([
      heading,
    ]);
    for (const text of content) {
      expect(document.querySelector("main")?.textContent).toContain(text);
    }
    expect(document.scripts).toHaveLength(0);
    expect(html).not.toMatch(/\[(?:[A-Z][A-Z _-]+)\]|Drafting note/);

    for (const element of document.querySelectorAll(
      "link[rel=stylesheet], link[rel=icon], img, a",
    )) {
      const target = new URL(element.getAttribute("src") ?? element.getAttribute("href")!, url);
      if (element.tagName === "A" && !target.href.startsWith(publicUrl)) {
        continue;
      }
      expect(target.href.startsWith(publicUrl)).toBe(true);
      const relativePath = target.href.slice(publicUrl.length);
      const file =
        relativePath === "" || relativePath.endsWith("/")
          ? `${relativePath}index.html`
          : relativePath;
      expect(existsSync(new URL(file, exportRoot))).toBe(true);
    }
    dom.window.close();
  });
});
