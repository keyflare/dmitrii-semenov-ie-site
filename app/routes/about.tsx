import type { MetaFunction } from "react-router";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `About - ${siteConfig.brandName}` },
  { name: "description", content: `About ${siteConfig.brandName}.` },
];

export default function AboutRoute() {
  return (
    <>
      <PageHeader
        title={`About ${siteConfig.brandName}`}
        description="Keyflare Studio publishes independent software products for app stores and desktop platforms."
        variant="document"
      />
      <DocumentPage>
        <p>
          Keyflare Studio is the public product identity for small software releases, support pages,
          privacy policies, and store-facing links.
        </p>
      </DocumentPage>
    </>
  );
}
