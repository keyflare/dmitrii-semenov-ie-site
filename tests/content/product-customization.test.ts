import { describe, expect, test } from "vitest";
import { customProductOverviewPages } from "../../app/content/products/customOverviewPages";
import { productMdxContent } from "../../app/content/products/customMdxContent";
import { products } from "../../app/content/products/registry";

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
});
