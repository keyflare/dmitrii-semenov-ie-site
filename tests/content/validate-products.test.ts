import { describe, expect, test } from "vitest";
import type { Product } from "../../app/content/products/types";
import { validateProducts } from "../../app/content/products/validate";

const baseProduct: Product = {
  status: "published",
  slug: "sample",
  name: "Sample",
  type: "mobile-app",
  shortDescription: "A sample product used by validation tests.",
  platforms: ["ios"],
  supportEmail: "support@example.com",
  lastUpdated: "2026-07-03",
  storeLinks: {},
  presentation: {
    overview: { mode: "standard" },
    support: { mode: "standard" },
    privacy: { mode: "generated" },
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: false,
    usesCrashReporting: false,
    hasAccounts: false,
    collectsPersonalData: false,
    requiresDataDeletionPage: false,
    thirdPartyServices: [],
  },
};

describe("validateProducts", () => {
  test("accepts complete published products", () => {
    expect(validateProducts([baseProduct])).toEqual([]);
  });

  test("accepts published mobile games with standard presentation", () => {
    const mobileGame: Product = {
      ...baseProduct,
      slug: "sample-game",
      type: "mobile-game",
    };

    expect(validateProducts([mobileGame])).toEqual([]);
  });

  test("rejects duplicate slugs", () => {
    const duplicateProduct: Product = {
      ...baseProduct,
      name: "Duplicate Sample",
    };

    expect(validateProducts([baseProduct, duplicateProduct])).toContain(
      "Duplicate product slug: sample",
    );
  });

  test("rejects published products without support email", () => {
    const productWithoutSupportEmail: Product = {
      ...baseProduct,
      supportEmail: "",
    };

    expect(validateProducts([productWithoutSupportEmail])).toContain(
      "Published product sample is missing supportEmail",
    );
  });

  test("rejects invalid lastUpdated values", () => {
    const productWithInvalidLastUpdated: Product = {
      ...baseProduct,
      lastUpdated: "July 3",
    };

    expect(validateProducts([productWithInvalidLastUpdated])).toContain(
      "Published product sample has invalid lastUpdated: July 3",
    );
  });

  test("rejects impossible lastUpdated dates", () => {
    const productWithImpossibleLastUpdated: Product = {
      ...baseProduct,
      lastUpdated: "2026-99-99",
    };

    expect(validateProducts([productWithImpossibleLastUpdated])).toContain(
      "Published product sample has invalid lastUpdated: 2026-99-99",
    );
  });

  test("rejects unsafe store URLs", () => {
    const productWithUnsafeStoreUrl: Product = {
      ...baseProduct,
      storeLinks: {
        ios: "javascript:alert(1)",
      },
    };

    expect(validateProducts([productWithUnsafeStoreUrl])).toContain(
      "Published product sample has invalid ios storeLink: javascript:alert(1)",
    );
  });

  test("rejects published products with unknown custom overview keys", () => {
    const productWithUnknownCustomOverview: Product = {
      ...baseProduct,
      presentation: {
        ...baseProduct.presentation,
        overview: { mode: "custom", componentKey: "missing-overview" as never },
      },
    };

    expect(validateProducts([productWithUnknownCustomOverview])).toContain(
      "Published product sample references unknown custom overview: missing-overview",
    );
  });

  test("rejects published products with unknown MDX content keys", () => {
    const productWithUnknownMdxContent: Product = {
      ...baseProduct,
      presentation: {
        ...baseProduct.presentation,
        support: { mode: "mdx", contentKey: "missing-mdx" as never },
      },
    };

    expect(validateProducts([productWithUnknownMdxContent])).toContain(
      "Published product sample references unknown MDX content: missing-mdx",
    );
  });

  test("allows fixture products to stay out of public validation", () => {
    const fixtureProduct: Product = {
      ...baseProduct,
      status: "fixture",
      supportEmail: "",
      lastUpdated: "July 3",
    };

    expect(validateProducts([fixtureProduct])).toEqual([]);
  });
});
