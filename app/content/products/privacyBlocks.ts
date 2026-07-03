import { siteConfig } from "../site";
import type { Product } from "./types";

export function getPrivacySections(product: Product) {
  const sections = [
    {
      title: "Operator",
      body: `${product.name} is published by ${siteConfig.legalOperator}.`,
    },
    {
      title: "Contact",
      body: `For privacy questions, contact ${product.supportEmail}.`,
    },
    {
      title: "Data Collection",
      body: product.privacyProfile.collectsPersonalData
        ? "This product may process product-specific data described on this page."
        : "This product is configured as not collecting personal data directly.",
    },
  ];

  if (product.privacyProfile.usesAdMob) {
    sections.push({
      title: "Advertising",
      body: "This product may use Google AdMob to show ads. AdMob may process data according to Google's advertising technology policies.",
    });
  }

  if (product.privacyProfile.usesAnalytics) {
    sections.push({
      title: "Analytics",
      body: "This product may use analytics services to understand aggregate product usage and reliability.",
    });
  }

  if (product.privacyProfile.usesCrashReporting) {
    sections.push({
      title: "Crash Reporting",
      body: "This product may use crash reporting to diagnose defects and improve stability.",
    });
  }

  sections.push({
    title: "Updates",
    body: `Last updated: ${product.lastUpdated}.`,
  });

  return sections;
}
