import type { MetaFunction } from "react-router";
import { ProductCard } from "~/components/ProductCard";
import { PageHeader } from "~/components/PageHeader";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Products - ${siteConfig.brandName}` },
  { name: "description", content: `Products published by ${siteConfig.brandName}.` },
];

export default function ProductsIndexRoute() {
  const products = getPublishedProducts();

  return (
    <div className="catalog-layout">
      <PageHeader
        eyebrow="Launch board"
        title="Products"
        description={`Mobile apps, desktop apps, and software products from ${siteConfig.brandName}.`}
      />
      {products.length === 0 ? (
        <section className="catalog-empty">
          <h2>No public launches yet</h2>
          <p>
            Published products will appear here once their store, support, and policy pages are
            ready.
          </p>
        </section>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
