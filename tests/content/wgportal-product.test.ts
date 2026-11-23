import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import { ProductCard } from "../../app/components/ProductCard";
import { ProductLinks } from "../../app/components/ProductLinks";
import { findPublishedProduct, getPublicPaths } from "../../app/content/products/registry";
import { productSiteSources } from "../../scripts/product-site-sources";

test("publishes the WG Portal website and its App Store documents from the tagged export", () => {
  expect(findPublishedProduct("wgportal")).toMatchObject({
    status: "published",
    platforms: ["tvos"],
    storeLinks: { tvos: "https://apps.apple.com/app/id6835040683" },
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

test("offers the released WG Portal app from the studio catalog", () => {
  const product = findPublishedProduct("wgportal");
  if (!product) {
    throw new Error("Missing published WG Portal product");
  }
  for (const component of [ProductCard, ProductLinks]) {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(component, { product })),
    );
    expect(html).toContain('href="https://apps.apple.com/app/id6835040683"');
    expect(html).not.toContain("In development");
    expect(html).not.toContain("coming soon");
  }
});
