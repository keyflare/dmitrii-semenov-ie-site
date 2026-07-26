import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  findPublishedProduct,
  getPrerenderPaths,
  products,
} from "../../app/content/products/registry";
import { getProductDataDeletionProduct } from "../../app/routes/product-data-deletion";
import { getProductOverviewProduct } from "../../app/routes/product-overview";
import { getProductPrivacyProduct } from "../../app/routes/product-privacy";
import { getProductSupportProduct } from "../../app/routes/product-support";
import { getProductTermsProduct } from "../../app/routes/product-terms";

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
  test("provides a product Terms route module", () => {
    expect(
      existsSync(new URL("../../app/routes/product-terms.tsx", import.meta.url)),
    ).toBe(true);
  });

  test("provides a public Terms product guard", async () => {
    const termsRoute = await import("../../app/routes/product-terms");

    expect(termsRoute.getProductTermsProduct).toBeTypeOf("function");
  });

  test("returns 404 for published products without configured Terms", () => {
    let thrown: unknown;

    try {
      getProductTermsProduct("palette-master");
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });

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

  test("prerenders Terms only when a published product configures them", () => {
    const paletteMaster = products.find((product) => product.slug === "palette-master");

    if (!paletteMaster) {
      throw new Error("Missing Palette Master test product");
    }

    const originalTerms = paletteMaster.presentation.terms;

    paletteMaster.presentation.terms = {
      mode: "mdx",
      contentKey: "palette-master-privacy",
    };

    try {
      expect(getPrerenderPaths()).toContain("/products/palette-master/terms");
    } finally {
      paletteMaster.presentation.terms = originalTerms;
    }
  });

  test.each([
    ["overview", getProductOverviewProduct],
    ["privacy", getProductPrivacyProduct],
    ["terms", getProductTermsProduct],
    ["support", getProductSupportProduct],
    ["data deletion", getProductDataDeletionProduct],
  ])("throws 404 for fixture product on the %s route", (_routeName, getRouteProduct) => {
    expectFixtureRoute404(getRouteProduct);
  });
});
