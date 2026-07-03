import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Legal - ${siteConfig.brandName}` },
  { name: "description", content: `Legal information for ${siteConfig.brandName}.` },
];

export default function LegalRoute() {
  return (
    <>
      <PageHeader title="Legal" description={`Operator: ${siteConfig.legalOperator}.`} />
      <p>
        Business contact:{" "}
        <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
      </p>
      <p>
        <Link to="/legal/privacy/">Website privacy policy</Link>
      </p>
    </>
  );
}
