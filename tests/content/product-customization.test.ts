import { describe, expect, test } from "vitest";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import {
  findPublishedProduct,
  getPrerenderPaths,
  getPublishedProducts,
  products,
} from "../../app/content/products/registry";

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
});
