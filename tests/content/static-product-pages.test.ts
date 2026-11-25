import { describe, expect, test } from "vitest";
import {
  getProductPaths,
  getPublicPaths,
  getPrerenderPaths,
  getPublishedStaticProducts,
  products,
} from "../../app/content/products/registry";
import { validateProducts } from "../../app/content/products/validate";
import { buildSitemapXml } from "../../scripts/generate-static-metadata";

const wgportal = getPublishedStaticProducts().find((product) => product.slug === "wgportal")!;
const additionalPages = ["blog", "blog/bring-your-own-vpn-to-apple-tv"];
const productWithBlog = {
  ...wgportal,
  staticSite: { hasTerms: true, additionalPages },
};

describe("additional product-owned static pages", () => {
  test("includes nested pages under the owning product path", () => {
    expect(getProductPaths(productWithBlog)).toEqual(
      expect.arrayContaining(additionalPages.map((path) => `/products/wgportal/${path}`)),
    );
    expect(validateProducts([productWithBlog])).toEqual([]);
  });

  test("includes published pages in the sitemap without studio prerendering", () => {
    products.push({ ...productWithBlog, slug: "blog-preview" });
    try {
      const path = "/products/blog-preview/blog/bring-your-own-vpn-to-apple-tv";
      expect(getPublicPaths()).toContain(path);
      expect(getPrerenderPaths()).not.toContain(path);
      expect(buildSitemapXml("https://www.keyflare.studio", getPublicPaths())).toContain(
        `<loc>https://www.keyflare.studio${path}/</loc>`,
      );
    } finally {
      products.pop();
    }
  });

  test.each(["draft", "fixture"] as const)("excludes a %s product's extra pages", (status) => {
    products.push({ ...productWithBlog, slug: "hidden-blog", status });
    try {
      expect(getPublicPaths().some((path) => path.startsWith("/products/hidden-blog"))).toBe(false);
    } finally {
      products.pop();
    }
  });

  test.each([
    "/blog",
    "blog/",
    "../blog",
    "blog/../privacy",
    "blog//story",
    "blog?preview=true",
    "blog#story",
    "https://example.com/blog",
    "privacy",
    "support",
    "terms",
    "data-deletion",
    "assets/story",
  ])("rejects unsafe or reserved page declarations: %s", (path) => {
    const invalid = { ...productWithBlog, staticSite: { additionalPages: [path] } };
    expect(validateProducts([invalid])).toContain(
      `wgportal staticSite.additionalPages contains an invalid or reserved path: ${path}`,
    );
  });

  test.each(["fr-CA", "pt-BR/privacy", "pt-PT/support", "zh-Hant/blog/article", "es-419/terms"])(
    "accepts a locale prefix while preserving its canonical case: %s",
    (path) => {
      const localized = { ...productWithBlog, staticSite: { additionalPages: [path] } };
      expect(validateProducts([localized])).toEqual([]);
      expect(getProductPaths(localized)).toContain(`/products/wgportal/${path}`);
    },
  );

  test.each(["Blog", "blog/Story", "blog/fr-CA", "FR-ca", "fr-CA/Privacy", "fr-CA/../terms"])(
    "rejects uppercase ordinary segments and unsafe localized paths: %s",
    (path) => {
      const invalid = { ...productWithBlog, staticSite: { additionalPages: [path] } };
      expect(validateProducts([invalid])).toContain(
        `wgportal staticSite.additionalPages contains an invalid or reserved path: ${path}`,
      );
    },
  );

  test("publishes every WG Portal translation in the sitemap and analytics route list", () => {
    const locales = [
      "ar",
      "cs",
      "da",
      "de",
      "el",
      "es",
      "es-419",
      "fr",
      "fr-CA",
      "it",
      "ja",
      "ko",
      "ms",
      "nb",
      "nl",
      "pl",
      "pt-BR",
      "pt-PT",
      "ru",
      "sv",
      "tr",
      "vi",
      "zh-Hant",
    ];
    const pages = [
      "",
      "privacy",
      "terms",
      "support",
      "blog",
      "blog/amneziawg-vs-wireguard",
      "blog/bring-your-own-vpn-to-apple-tv",
    ];
    const expected = locales.flatMap((locale) =>
      pages.map((page) => `/products/wgportal/${locale}${page ? `/${page}` : ""}`),
    );
    const paths = getProductPaths(wgportal);
    expect(paths).toHaveLength(169);
    expect(new Set(paths).size).toBe(169);
    expect(paths).toEqual(expect.arrayContaining(expected));
    expect(validateProducts([wgportal])).toEqual([]);
    const publicPaths = getPublicPaths();
    const sitemap = buildSitemapXml("https://www.keyflare.studio", publicPaths);
    for (const path of expected) {
      expect(publicPaths).toContain(path);
      expect(getPrerenderPaths()).not.toContain(path);
      expect(sitemap).toContain(`<loc>https://www.keyflare.studio${path}/</loc>`);
    }
  });

  test("rejects duplicate page declarations", () => {
    const invalid = { ...productWithBlog, staticSite: { additionalPages: ["blog", "blog"] } };
    expect(validateProducts([invalid])).toContain(
      "wgportal staticSite.additionalPages contains a duplicate path: blog",
    );
  });
});
