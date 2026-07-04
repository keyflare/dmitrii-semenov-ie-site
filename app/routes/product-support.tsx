import { createElement } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/product-support";
import { PageHeader } from "~/components/PageHeader";
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
        ? `${product.name} Support - ${siteConfig.brandName}`
        : `Support - ${siteConfig.brandName}`,
    },
    { name: "description", content: product ? `Support for ${product.name}.` : "Product support." },
  ];
};

export function getProductSupportProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return product;
}

export function ProductSupportContent({ product }: { product: Product }) {
  const support = product.presentation.support;

  return (
    <>
      <PageHeader title={`${product.name} Support`} description={product.shortDescription} />
      <p>
        Email: <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>
      </p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      {support.mode === "mdx"
        ? createElement(getProductMdxContent(support.contentKey), {
            components: productMdxComponents,
          })
        : null}
    </>
  );
}

export default function ProductSupportRoute({ params }: Route.ComponentProps) {
  const product = getProductSupportProduct(params.slug);

  return <ProductSupportContent product={product} />;
}
