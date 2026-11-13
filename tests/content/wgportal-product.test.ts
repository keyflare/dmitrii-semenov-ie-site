import { expect, test } from "vitest";
import {
  findPublishedProduct,
  getProductPaths,
  products,
} from "../../app/content/products/registry";

test("prepares the WG Portal export paths while keeping the product private before release", () => {
  const product = products.find(({ slug }) => slug === "wgportal");
  expect(product).toMatchObject({
    status: "draft",
    platforms: ["tvos"],
    staticSite: { hasTerms: true },
    privacyProfile: { usesSubscriptions: false },
  });
  expect(getProductPaths(product!)).toEqual([
    "/products/wgportal",
    "/products/wgportal/privacy",
    "/products/wgportal/support",
    "/products/wgportal/terms",
  ]);
  expect(findPublishedProduct("wgportal")).toBeUndefined();
});
