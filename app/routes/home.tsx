import type { MetaFunction } from "react-router";
import { ProductCard } from "~/components/ProductCard";
import { StudioHero } from "~/components/StudioHero";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.brandName} - Software Products` },
  { name: "description", content: "Official product hub for Keyflare Studio apps and software." },
];

export default function HomeRoute() {
  const products = getPublishedProducts();
  return (
    <div className="home-layout">
      <StudioHero />
      <section className="home-products" aria-labelledby="launch-board-title">
        <div className="section-heading">
          <h2 id="launch-board-title">Launch board</h2>
          <span aria-hidden="true" />
        </div>
        {products.length === 0 ? (
          <p>Published products will appear here once they are ready for app-store submission.</p>
        ) : (
          <div className="home-products-grid">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} headingLevel="h3" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
