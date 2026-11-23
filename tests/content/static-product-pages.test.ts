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

  test("rejects duplicate page declarations", () => {
    const invalid = { ...productWithBlog, staticSite: { additionalPages: ["blog", "blog"] } };
    expect(validateProducts([invalid])).toContain(
      "wgportal staticSite.additionalPages contains a duplicate path: blog",
    );
  });
});
