import { Link } from "react-router";
import type { Route } from "./+types/product-overview";
import { PageHeader } from "~/components/PageHeader";
import { findPublishedProduct } from "~/content/products/registry";
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

export default function ProductOverviewRoute({ params }: Route.ComponentProps) {
  const product = getProductOverviewProduct(params.slug);

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
