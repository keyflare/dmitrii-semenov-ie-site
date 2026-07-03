import { describe, expect, test } from "vitest";
import { findPublishedProduct, getPrerenderPaths } from "../../app/content/products/registry";

describe("product route paths", () => {
  test("includes static public routes", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining(["/", "/products", "/about", "/contact", "/legal", "/legal/privacy"]),
    );
  });

  test("does not prerender fixture product routes", () => {
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product");
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product/privacy");
  });

  test("does not expose fixture products through the public lookup", () => {
    expect(findPublishedProduct("fixture-product")).toBeUndefined();
  });
});
