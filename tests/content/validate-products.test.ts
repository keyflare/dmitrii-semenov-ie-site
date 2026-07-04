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

  test("accepts valid product theme metadata", () => {
    const productWithTheme: Product = {
      ...baseProduct,
      theme: {
        accentPrimary: "#ff4f64",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "linear-gradient(90deg, #ff4f64, #ffb000, #19d3a2, #2563ff)",
        visualVolume: "poster",
      },
    };

    expect(validateProducts([productWithTheme])).toEqual([]);
  });

  test("rejects invalid product theme color metadata", () => {
    const productWithInvalidThemeColor: Product = {
      ...baseProduct,
      theme: {
        accentPrimary: "ff4f64",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "linear-gradient(90deg, #ff4f64, #ffb000, #19d3a2, #2563ff)",
        visualVolume: "poster",
      },
    };

    expect(validateProducts([productWithInvalidThemeColor])).toContain(
      "sample theme.accentPrimary must be a six-digit hex color.",
    );
  });

  test("rejects invalid product theme gradient metadata", () => {
    const productWithInvalidThemeGradient: Product = {
      ...baseProduct,
      theme: {
        accentPrimary: "#ff4f64",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "not-a-gradient",
        visualVolume: "poster",
      },
    };

    expect(validateProducts([productWithInvalidThemeGradient])).toContain(
      "sample theme.gradient must be a CSS gradient value.",
    );
  });

  test("rejects product theme gradient metadata with invalid prefixes", () => {
    const productWithInvalidThemeGradientPrefix: Product = {
      ...baseProduct,
      theme: {
        accentPrimary: "#ff4f64",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "not-css gradient(",
        visualVolume: "poster",
      },
    };

    expect(validateProducts([productWithInvalidThemeGradientPrefix])).toContain(
      "sample theme.gradient must be a CSS gradient value.",
    );
  });

  test.each(["linear-gradient(", "linear-gradient(foo"])(
    "rejects malformed product theme gradient metadata: %s",
    (gradient) => {
      const productWithMalformedThemeGradient: Product = {
        ...baseProduct,
        theme: {
          accentPrimary: "#ff4f64",
          accentSecondary: "#ffb000",
          accentTertiary: "#19d3a2",
          ink: "#15111c",
          surface: "#fff4d7",
          gradient,
          visualVolume: "poster",
        },
      };

      expect(validateProducts([productWithMalformedThemeGradient])).toContain(
        "sample theme.gradient must be a CSS gradient value.",
      );
    },
  );

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
