import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { PosterButton } from "~/components/PosterButton";
import { ProductCard } from "~/components/ProductCard";
import { StudioLogo } from "~/components/StudioLogo";
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
          eyebrow="BY DMITRII SEMENOV"
          eyebrowAlign="end"
          id="home-title"
          title={
            <>
              <span className="home-title-keyflare-line">
                <span className="home-title-keyflare-stem">
                  <StudioLogo asset="rectangular" className="home-title-logo" />
                  Keyflar
                </span>
              </span>
              <span className="home-title-second-line">
                <span className="home-title-keyflare-tail">e</span>
                <span className="home-title-studio-word">Studio</span>
              </span>
            </>
          }
          description="Tiny apps, loud ideas. Mobile games, tools, and software products with a bright studio pulse."
        />
        <div className="home-actions">
          <PosterButton to="/products/" size="hero" tone="primary">
            View products
          </PosterButton>
          <PosterButton to="/contact/" size="hero">
            Contact studio
          </PosterButton>
        </div>
      </section>
      <section className="home-poster" aria-label="Studio product signals">
        <div className="home-poster-number">01</div>
        <div className="home-poster-title">
          <span className="home-poster-title-token">Apps /</span>{" "}
          <span className="home-poster-title-token">Games /</span>{" "}
          <span className="home-poster-title-token">Tools</span>
        </div>
        <p>
          Store-facing product pages, support links, and privacy policies wrapped in a visual system
          with teeth.
        </p>
        <div className="home-poster-strip" />
      </section>
      <section className="home-products" aria-label="Published products">
        <h2>Launch board</h2>
        {products.length === 0 ? (
          <p>Published products will appear here once they are ready for app-store submission.</p>
        ) : (
          <div className="home-products-grid">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
