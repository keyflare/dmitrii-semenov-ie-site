import { describe, expect, test } from "vitest";
import { findPublishedProduct, getPrerenderPaths } from "../../app/content/products/registry";
import { getProductDataDeletionProduct } from "../../app/routes/product-data-deletion";
import { getProductOverviewProduct } from "../../app/routes/product-overview";
import { getProductPrivacyProduct } from "../../app/routes/product-privacy";
import { getProductSupportProduct } from "../../app/routes/product-support";

function expectFixtureRoute404(getRouteProduct: (slug: string) => unknown) {
  let thrown: unknown;

  try {
    getRouteProduct("fixture-product");
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(Response);
  expect((thrown as Response).status).toBe(404);
}

describe("product route paths", () => {
  test("includes static public routes", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining(["/", "/products", "/contact", "/privacy", "/legal"]),
    );
    expect(getPrerenderPaths()).not.toContain("/about");
    expect(getPrerenderPaths()).not.toContain("/legal/privacy");
  });

  test("does not prerender fixture product routes", () => {
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product");
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product/privacy");
  });

  test("does not expose fixture products through the public lookup", () => {
    expect(findPublishedProduct("fixture-product")).toBeUndefined();
  });

  test.each([
    ["overview", getProductOverviewProduct],
    ["privacy", getProductPrivacyProduct],
    ["support", getProductSupportProduct],
    ["data deletion", getProductDataDeletionProduct],
  ])("throws 404 for fixture product on the %s route", (_routeName, getRouteProduct) => {
    expectFixtureRoute404(getRouteProduct);
  });
});
