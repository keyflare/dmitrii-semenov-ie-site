export type ProductStatus = "published" | "draft" | "fixture";

export type ProductType = "mobile-app" | "desktop-app" | "tool" | "software";

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
  privacyProfile: PrivacyProfile;
};
