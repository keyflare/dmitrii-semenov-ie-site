import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import {
  findPublishedProduct,
  getPrerenderPaths,
  getPublishedProducts,
  products,
} from "../../app/content/products/registry";
import type { Product } from "../../app/content/products/types";
import { getProductDataDeletionProduct } from "../../app/routes/product-data-deletion";
import {
  getProductOverviewProduct,
  ProductOverviewContent,
} from "../../app/routes/product-overview";
import { getProductPrivacyProduct, ProductPrivacyContent } from "../../app/routes/product-privacy";
import { getProductSupportProduct, ProductSupportContent } from "../../app/routes/product-support";

function getRegistryProduct(slug: string): Product {
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    throw new Error(`Missing test product: ${slug}`);
  }

  return product;
}

function expectRoute404(getRouteProduct: (slug: string) => unknown, slug: string) {
  let thrown: unknown;

  try {
    getRouteProduct(slug);
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(Response);
  expect((thrown as Response).status).toBe(404);
}

function renderWithRouter(element: ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

describe("product customization", () => {
  test("standard fixture product uses the standard presentation", () => {
    const fixtureProduct = products.find((product) => product.slug === "fixture-product");

    expect(fixtureProduct?.presentation).toEqual({
      overview: { mode: "standard" },
      support: { mode: "standard" },
      privacy: { mode: "generated" },
    });
  });

  test("custom overview registry contains Palette Master", () => {
    expect(customProductOverviewPages).toHaveProperty("palette-master");
  });

  test("MDX content registry contains Palette Master content sections", () => {
    expect(productMdxContent).toHaveProperty("palette-master-overview");
    expect(productMdxContent).toHaveProperty("palette-master-support");
    expect(productMdxContent).toHaveProperty("palette-master-privacy-extra");
  });

  test("draft Palette Master exists but is not returned as published", () => {
    const paletteMaster = products.find((product) => product.slug === "palette-master");

    expect(paletteMaster?.status).toBe("draft");
    expect(getPublishedProducts()).not.toContainEqual(
      expect.objectContaining({ slug: "palette-master" }),
    );
  });

  test("draft Palette Master is absent from public product paths", () => {
    expect(findPublishedProduct("palette-master")).toBeUndefined();
    expect(getPrerenderPaths()).not.toContain("/products/palette-master");
    expect(getPrerenderPaths()).not.toContain("/products/palette-master/privacy");
    expect(getPrerenderPaths()).not.toContain("/products/palette-master/support");
  });

  test.each([
    ["overview", getProductOverviewProduct],
    ["privacy", getProductPrivacyProduct],
    ["support", getProductSupportProduct],
    ["data deletion", getProductDataDeletionProduct],
  ])("throws 404 for draft Palette Master on the %s route", (_routeName, getRouteProduct) => {
    expectRoute404(getRouteProduct, "palette-master");
  });

  test("renders a custom overview component when configured", () => {
    const html = renderWithRouter(
      createElement(ProductOverviewContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toContain("Palette Master is a color-focused mobile game");
  });

  test("renders standard overview with appended MDX content when configured", () => {
    const product: Product = {
      ...getRegistryProduct("palette-master"),
      slug: "palette-master-standard",
      presentation: {
        overview: { mode: "standard-with-mdx", contentKey: "palette-master-overview" },
        support: { mode: "standard" },
        privacy: { mode: "generated" },
      },
    };

    const html = renderWithRouter(createElement(ProductOverviewContent, { product }));

    expect(html).toContain("Type:");
    expect(html).toContain("Gameplay");
  });

  test("renders support MDX content when configured", () => {
    const html = renderWithRouter(
      createElement(ProductSupportContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toContain("Email:");
    expect(html).toContain("Support Notes");
  });

  test("keeps generated privacy sections and appends MDX content when configured", () => {
    const html = renderWithRouter(
      createElement(ProductPrivacyContent, { product: getRegistryProduct("palette-master") }),
    );

    expect(html).toContain("Operator");
    expect(html).toContain("Product-Specific Notes");
  });
});
