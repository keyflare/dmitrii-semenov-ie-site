import { Link } from "react-router";
import type { Route } from "./+types/product-support";
import { PageHeader } from "~/components/PageHeader";
import { findRoutableProduct } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: Route.MetaFunction = ({ params }) => {
  const product = findRoutableProduct(params.slug);

  return [
    {
      title: product
        ? `${product.name} Support - ${siteConfig.brandName}`
        : `Support - ${siteConfig.brandName}`,
    },
    { name: "description", content: product ? `Support for ${product.name}.` : "Product support." },
  ];
};

export default function ProductSupportRoute({ params }: Route.ComponentProps) {
  const product = findRoutableProduct(params.slug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return (
    <>
      <PageHeader title={`${product.name} Support`} description={product.shortDescription} />
      <p>
        Email: <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>
      </p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
    </>
  );
}
