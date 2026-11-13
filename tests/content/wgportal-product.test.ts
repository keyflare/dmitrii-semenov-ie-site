import { expect, test } from "vitest";
import { findPublishedProduct, getPublicPaths } from "../../app/content/products/registry";
import { productSiteSources } from "../../scripts/product-site-sources";

test("publishes the WG Portal website and its App Store documents from the tagged export", () => {
  expect(findPublishedProduct("wgportal")).toMatchObject({
    status: "published",
    platforms: ["tvos"],
    releaseStage: "in-development",
    staticSite: { hasTerms: true },
    privacyProfile: { usesSubscriptions: false },
  });

  const paths = getPublicPaths().filter((path) => path.startsWith("/products/wgportal"));
  expect(paths).toEqual([
    "/products/wgportal",
    "/products/wgportal/privacy",
    "/products/wgportal/support",
    "/products/wgportal/terms",
  ]);
  expect(productSiteSources.wgportal).toMatchObject({
    repository: "keyflare/WGPortal",
    tag: expect.stringMatching(/^site-v/),
    commit: expect.stringMatching(/^[0-9a-f]{40}$/),
    directory: "site/public",
  });
});
