export type ProductStatus = "published" | "draft" | "fixture";

export type ProductType = "mobile-app" | "mobile-game" | "desktop-app" | "tool" | "software";

export type ProductPlatform = "ios" | "android" | "macos" | "windows" | "linux" | "web";

export type PrivacyProfile = {
  usesAdMob: boolean;
  usesAnalytics: boolean;
  usesCrashReporting: boolean;
  hasAccounts: boolean;
  collectsPersonalData: boolean;
  requiresDataDeletionPage: boolean;
  thirdPartyServices: string[];
};

export const productCustomOverviewKeys = ["palette-master"] as const;

export type ProductCustomOverviewKey = (typeof productCustomOverviewKeys)[number];

export const productMdxContentKeys = [
  "palette-master-overview",
  "palette-master-support",
  "palette-master-privacy-extra",
] as const;

export type ProductMdxContentKey = (typeof productMdxContentKeys)[number];

export type ProductOverviewPresentation =
  | { mode: "standard" }
  | { mode: "standard-with-mdx"; contentKey: ProductMdxContentKey }
  | { mode: "custom"; componentKey: ProductCustomOverviewKey };

export type ProductSupportPresentation =
  { mode: "standard" } | { mode: "mdx"; contentKey: ProductMdxContentKey };

export type ProductPrivacyPresentation =
  { mode: "generated" } | { mode: "generated-with-mdx"; contentKey: ProductMdxContentKey };

export type ProductPresentation = {
  overview: ProductOverviewPresentation;
  support: ProductSupportPresentation;
  privacy: ProductPrivacyPresentation;
};

export type Product = {
  status: ProductStatus;
  slug: string;
  name: string;
  type: ProductType;
  shortDescription: string;
  platforms: ProductPlatform[];
  supportEmail: string;
  lastUpdated: string;
  storeLinks: Partial<Record<ProductPlatform, string>>;
  presentation: ProductPresentation;
  privacyProfile: PrivacyProfile;
};
