import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.brandName} - Software Products` },
  {
    name: "description",
    content: "Official product hub for Keyflare Studio apps and software.",
  },
];

export default function HomeRoute() {
  const products = getPublishedProducts();

  return (
    <div className="home-layout">
      <section className="home-hero" aria-labelledby="home-title">
        <PageHeader
          eyebrow="Independent software studio"
          id="home-title"
          title={siteConfig.brandName}
          description="Tiny apps, loud ideas. Mobile games, tools, and software products with a bright studio pulse."
        />
        <div className="home-actions">
          <Link to="/products/">View products</Link>
          <Link to="/contact/">Contact studio</Link>
        </div>
      </section>
      <section className="home-poster" aria-label="Studio product signals">
        <div className="home-poster-number">01</div>
        <div className="home-poster-title">Apps / Games / Tools</div>
        <p>
          Store-facing product pages, support links, and privacy policies wrapped in a visual system
          with teeth.
        </p>
        <div className="home-poster-strip" />
      </section>
      <section className="home-products" aria-label="Published products">
        <h2>Launch board</h2>
        <p>
          {products.length > 0
            ? "Published products appear here with store-safe links."
            : "Published products will appear here once they are ready for app-store submission."}
        </p>
      </section>
    </div>
  );
}
