import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Website Privacy Policy - ${siteConfig.brandName}` },
  { name: "description", content: `Website privacy policy for ${siteConfig.brandName}.` },
];

export default function PrivacyRoute() {
  const products = getPublishedProducts();

  return (
    <>
      <PageHeader
        title="Website Privacy Policy"
        description="Privacy information for visitors of this website and links to product policies."
        variant="document"
      />
      <DocumentPage>
        <section>
          <h2>Website Privacy</h2>
          <p>
            This website does not require user registration and does not intentionally collect
            personal information.
          </p>
          <p>
            This website is a static product and legal information hub for Keyflare Studio, operated
            by Dmitrii Semenov IE.
          </p>
        </section>

        <section>
          <h2>No Analytics or Tracking</h2>
          <p>
            This website does not use analytics, advertising trackers, account systems, or contact
            forms.
          </p>
        </section>

        <section>
          <h2>Email Contact</h2>
          <p>
            If you contact Keyflare Studio by email, the information you provide will be used only
            to respond to your inquiry.
          </p>
        </section>

        <section>
          <h2>Product Privacy Policies</h2>
          <p>
            Individual products published by Keyflare Studio may have their own privacy practices
            and product-specific privacy policies.
          </p>
          <ul>
            {products.map((product) => (
              <li key={product.slug}>
                <Link to={`/products/${product.slug}/privacy/`}>{product.name} Privacy Policy</Link>
              </li>
            ))}
          </ul>
        </section>

        <footer>Last updated: July 2026</footer>
      </DocumentPage>
    </>
  );
}
