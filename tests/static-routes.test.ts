import { describe, expect, test } from "vitest";
import { getPrerenderPaths, getPublicPaths } from "../app/content/products/registry";

describe("static route paths", () => {
  const ratebenchPaths = [
    "/products/ratebench",
    "/products/ratebench/privacy",
    "/products/ratebench/terms",
    "/products/ratebench/support",
  ];

  test("prerenders studio routes and Palette Master", () => {
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
      ]),
    );
    expect(getPrerenderPaths()).not.toContain("/products/palette-master/terms");
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product/terms");
    expect(getPrerenderPaths()).not.toContain("/about");
    expect(getPrerenderPaths()).not.toContain("/legal/privacy");
  });

  test("lists Ratebench in public paths and leaves its HTML to the product export", () => {
    for (const path of ratebenchPaths) {
      expect(getPublicPaths()).toContain(path);
      expect(getPrerenderPaths()).not.toContain(path);
    }
    expect(getPublicPaths()).not.toContain("/products/ratebench/data-deletion");
  });
});
