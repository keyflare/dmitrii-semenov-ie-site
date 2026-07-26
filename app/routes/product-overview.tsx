import { createElement } from "react";
import type { Route } from "./+types/product-overview";
import { PageHeader } from "~/components/PageHeader";
import { ProductPageFrame } from "~/components/ProductPageFrame";
import { ProductLinks } from "~/components/ProductLinks";
import { getCustomProductOverview } from "~/content/products/customOverviewPages";
import { getProductMdxContent } from "~/content/products/customMdxContent";
import { productMdxComponents } from "~/content/products/mdxComponents";
import { findPublishedProduct } from "~/content/products/registry";
import type { Product } from "~/content/products/types";
import { siteConfig } from "~/content/site";

export const meta: Route.MetaFunction = ({ params }) => {
  const product = findPublishedProduct(params.slug);

  return [
    {
      title: product
        ? `${product.name} - ${siteConfig.brandName}`
        : `Product - ${siteConfig.brandName}`,
    },
    { name: "description", content: product?.shortDescription ?? "Product page." },
  ];
};

export function getProductOverviewProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return product;
}

export function StandardProductOverview({ product }: { product: Product }) {
  return (
    <article className="product-overview">
      <PageHeader
        eyebrow={product.type}
        title={product.name}
        description={product.shortDescription}
      />
      <section className="product-panel" aria-label={`${product.name} details`}>
        <div>
          <h2>Product signal</h2>
          <p>Platforms: {product.platforms.join(" / ")}</p>
          <p>Type: {product.type}</p>
        </div>
        <ProductLinks product={product} />
      </section>
    </article>
  );
}

export function ProductOverviewContent({ product }: { product: Product }) {
  const overview = product.presentation.overview;
  let content;

  if (overview.mode === "custom") {
    content = createElement(getCustomProductOverview(overview.componentKey), { product });
  } else if (overview.mode === "standard-with-mdx") {
    content = (
      <>
        <StandardProductOverview product={product} />
        {createElement(getProductMdxContent(overview.contentKey), {
          components: productMdxComponents,
        })}
      </>
    );
  } else {
    content = <StandardProductOverview product={product} />;
  }

  return <ProductPageFrame product={product}>{content}</ProductPageFrame>;
}

export default function ProductOverviewRoute({ params }: Route.ComponentProps) {
  const product = getProductOverviewProduct(params.slug);

  return <ProductOverviewContent product={product} />;
}
