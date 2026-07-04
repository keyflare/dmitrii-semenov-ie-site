import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Website Privacy Policy - ${siteConfig.brandName}` },
  { name: "description", content: `Website privacy policy for ${siteConfig.brandName}.` },
];

export default function LegalPrivacyRoute() {
  return (
    <>
      <PageHeader
        title="Website Privacy Policy"
        description="Privacy information for visitors of this website."
      />
      <p>This website is operated by {siteConfig.legalOperator}.</p>
      <p>This page covers the website itself, not individual product privacy policies.</p>
    </>
  );
}
