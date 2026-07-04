import { createElement } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/product-overview";
import { PageHeader } from "~/components/PageHeader";
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
    <>
      <PageHeader title={product.name} description={product.shortDescription} />
      <p>Type: {product.type}</p>
      <p>Platforms: {product.platforms.join(", ")}</p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      <p>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </p>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <p>
          <Link to={`/products/${product.slug}/data-deletion/`}>Data deletion</Link>
        </p>
      ) : null}
    </>
  );
}

export function ProductOverviewContent({ product }: { product: Product }) {
  const overview = product.presentation.overview;

  if (overview.mode === "custom") {
    return createElement(getCustomProductOverview(overview.componentKey), { product });
  }

  if (overview.mode === "standard-with-mdx") {
    return (
      <>
        <StandardProductOverview product={product} />
        {createElement(getProductMdxContent(overview.contentKey), {
          components: productMdxComponents,
        })}
      </>
    );
  }

  return <StandardProductOverview product={product} />;
}

export default function ProductOverviewRoute({ params }: Route.ComponentProps) {
  const product = getProductOverviewProduct(params.slug);

  return <ProductOverviewContent product={product} />;
}
