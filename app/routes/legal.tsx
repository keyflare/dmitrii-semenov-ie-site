import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Legal - ${siteConfig.brandName}` },
  {
    name: "description",
    content: `Business and legal information for ${siteConfig.brandName}.`,
  },
];

export default function LegalRoute() {
  return (
    <>
      <PageHeader
        title="Legal"
        description={`Business and legal information for ${siteConfig.brandName}.`}
        variant="document"
      />
      <DocumentPage>
        <section>
          <h2>Business Information</h2>
          <p>
            Keyflare Studio is an independent software development and publishing brand operated by
            Dmitrii Semenov IE, a registered Individual Entrepreneur in the Republic of Armenia.
          </p>
          <p>
            Keyflare Studio develops, publishes, and supports software products for Apple, Android,
            macOS, Windows, and other platforms.
          </p>
        </section>

        <section>
          <h2>Legal Entity</h2>
          <dl>
            <div>
              <dt>Legal entity</dt>
              <dd>Dmitrii Semenov IE</dd>
            </div>
            <div>
              <dt>Business type</dt>
              <dd>Individual Entrepreneur (IE)</dd>
            </div>
            <div>
              <dt>Country of registration</dt>
              <dd>Republic of Armenia</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>Brand</h2>
          <p>Keyflare Studio is the public business brand of Dmitrii Semenov IE.</p>
          <p>
            All software products, services, websites, and applications published under the Keyflare
            Studio name are operated by Dmitrii Semenov IE.
          </p>
          <p>
            References to "Keyflare Studio", "we", "our", or "us" throughout this website refer to
            Dmitrii Semenov IE.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Business and legal inquiries:{" "}
            <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
          </p>
        </section>

        <section>
          <h2>Legal Documents</h2>
          <p>
            Individual applications published by Keyflare Studio may provide their own Privacy
            Policy, Terms of Service, End User License Agreement (EULA), or other legal
            documentation where applicable.
          </p>
          <p>
            Please refer to the corresponding application page for product-specific legal
            information.
          </p>
          <p>
            <Link to="/legal/privacy/">Website privacy policy</Link>
          </p>
        </section>

        <section>
          <h2>Registration Requests</h2>
          <p>
            Business registration information is available upon legitimate request from business
            partners, payment providers, platform operators, or government authorities.
          </p>
        </section>

        <footer>Last updated: July 2026</footer>
      </DocumentPage>
    </>
  );
}
