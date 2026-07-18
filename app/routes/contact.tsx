import type { MetaFunction } from "react-router";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { PageIcon } from "~/components/PageIcon";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Contact - ${siteConfig.brandName}` },
  { name: "description", content: `Business contact for ${siteConfig.brandName}.` },
];

export default function ContactRoute() {
  return (
    <>
      <PageHeader
        icon={<PageIcon name="contact" />}
        title="Contact"
        description="Business inquiries for Keyflare Studio."
        variant="document"
      />
      <DocumentPage>
        <p>
          Email: <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
        </p>
      </DocumentPage>
    </>
  );
}
