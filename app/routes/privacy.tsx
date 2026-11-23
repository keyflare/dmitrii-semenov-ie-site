import type { MetaFunction } from "react-router";
import { SiteLink as Link } from "~/components/SiteLink";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { PageIcon } from "~/components/PageIcon";
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
        icon={<PageIcon name="privacy" />}
        title="Website Privacy Policy"
        description="Privacy information for visitors of this website and links to product policies."
        variant="document"
      />
      <DocumentPage>
        <section>
          <h2>Website Privacy</h2>
          <p>This website does not require registration.</p>
          <p>
            This website is a static product and legal information hub for Keyflare Studio, operated
            by Dmitrii Semenov, IE.
          </p>
        </section>

        <section>
          <h2>Website Analytics</h2>
          <p>
            This website uses Yandex Metrica to measure page visits and interactions with
            navigation, store, support, and other controls. Studio and product websites use separate
            counters. Website analytics is separate from analytics inside the apps.
          </p>
          <p>
            Yandex may process cookie identifiers, IP address, browser and device information,
            referrers, approved campaign tags, and page and interaction data. Session Replay, click
            maps, automatic outbound-link tracking, and tag management are disabled. We do not send
            form values, email message contents, or arbitrary URL query strings and fragments in our
            analytics events.
          </p>
          <p>
            We use these statistics to understand website usage and improve product information.
            Yandex processes data according to its{" "}
            <a href="https://yandex.com/legal/confidential/">Privacy Policy</a>, which also
            describes retention and international processing. You can block analytics in your
            browser or use the{" "}
            <a href="https://yandex.com/support/metrica/en/general/opt-out.html">
              Yandex Metrica opt-out
            </a>
            . For privacy requests, contact{" "}
            <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>.
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
                <Link
                  reloadDocument={Boolean(product.staticSite)}
                  to={`/products/${product.slug}/privacy/`}
                >
                  {product.name} Privacy Policy
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer>Last updated: November 23, 2026</footer>
      </DocumentPage>
    </>
  );
}
