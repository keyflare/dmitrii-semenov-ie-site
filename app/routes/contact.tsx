import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Contact - ${siteConfig.brandName}` },
  { name: "description", content: `Business contact for ${siteConfig.brandName}.` },
];

export default function ContactRoute() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="Business inquiries for Keyflare Studio."
        variant="document"
      />
      <p>
        Email: <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
      </p>
    </>
  );
}
