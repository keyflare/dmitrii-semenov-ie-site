import { describe, expect, test } from "vitest";
import { getPrerenderPaths } from "../app/content/products/registry";

describe("static route paths", () => {
  test("includes static pages and published Palette Master pages", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining([
        "/",
        "/products",
        "/contact",
        "/privacy",
        "/legal",
        "/products/palette-master",
        "/products/palette-master/privacy",
        "/products/palette-master/support",
        "/products/ratebench",
        "/products/ratebench/privacy",
        "/products/ratebench/terms",
        "/products/ratebench/support",
      ]),
    );
    expect(getPrerenderPaths()).not.toContain("/products/palette-master/terms");
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product/terms");
    expect(getPrerenderPaths()).not.toContain("/about");
    expect(getPrerenderPaths()).not.toContain("/legal/privacy");
  });
});
