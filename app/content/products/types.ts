export type ProductStatus = "published" | "draft" | "fixture";

export type ProductType = "mobile-app" | "mobile-game" | "desktop-app" | "tool" | "software";

export type ProductPlatform = "ios" | "android" | "macos" | "windows" | "linux" | "web";

export type ProductReleaseStage = "in-development";

export type PrivacyProfile = {
  usesAdMob: boolean;
  usesAnalytics: boolean;
  usesCrashReporting: boolean;
  usesSubscriptions: boolean;
  hasAccounts: boolean;
  collectsPersonalData: boolean;
  requiresDataDeletionPage: boolean;
  thirdPartyServices: string[];
};

export const productCustomOverviewKeys = ["palette-master", "ratebench"] as const;

export type ProductCustomOverviewKey = (typeof productCustomOverviewKeys)[number];

export const productMdxContentKeys = [
  "palette-master-overview",
  "palette-master-support",
  "palette-master-privacy",
  "ratebench-support",
  "ratebench-privacy",
  "ratebench-terms",
] as const;

export type ProductMdxContentKey = (typeof productMdxContentKeys)[number];

export type ProductOverviewPresentation =
  | { mode: "standard" }
  | { mode: "standard-with-mdx"; contentKey: ProductMdxContentKey }
  | { mode: "custom"; componentKey: ProductCustomOverviewKey };

export type ProductSupportPresentation =
  { mode: "standard" } | { mode: "mdx"; contentKey: ProductMdxContentKey };

export type ProductPrivacyPresentation =
  | { mode: "generated" }
  | { mode: "generated-with-mdx"; contentKey: ProductMdxContentKey }
  | { mode: "mdx"; contentKey: ProductMdxContentKey };

export type ProductTermsPresentation = {
  mode: "mdx";
  contentKey: ProductMdxContentKey;
};

export type ProductPresentation = {
  overview: ProductOverviewPresentation;
  support: ProductSupportPresentation;
  privacy: ProductPrivacyPresentation;
  terms?: ProductTermsPresentation;
};

export type ProductVisualVolume = "calm" | "poster" | "immersive";

export type ProductTheme = {
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  ink: string;
  surface: string;
  gradient: string;
  visualVolume: ProductVisualVolume;
};

export type Product = {
  status: ProductStatus;
  slug: string;
  name: string;
  type: ProductType;
  shortDescription: string;
  platforms: ProductPlatform[];
  releaseStage?: ProductReleaseStage;
  supportEmail: string;
  lastUpdated: string;
  storeLinks: Partial<Record<ProductPlatform, string>>;
  presentation: ProductPresentation;
  theme?: ProductTheme;
  privacyProfile: PrivacyProfile;
};
