import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `About - ${siteConfig.brandName}` },
  { name: "description", content: `About ${siteConfig.brandName}.` },
];

export default function AboutRoute() {
  return (
    <PageHeader
      title={`About ${siteConfig.brandName}`}
      description="Keyflare Studio publishes independent software products for app stores and desktop platforms."
      variant="document"
    />
  );
}
