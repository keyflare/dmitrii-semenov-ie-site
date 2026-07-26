import { createElement } from "react";
import type { Route } from "./+types/product-terms";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { ProductPageFrame } from "~/components/ProductPageFrame";
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
        ? `${product.name} Terms of Service - ${siteConfig.brandName}`
        : `Terms of Service - ${siteConfig.brandName}`,
    },
    {
      name: "description",
      content: product ? `Terms of Service for ${product.name}.` : "Terms of Service.",
    },
  ];
};

export function getProductTermsProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product?.presentation.terms) {
    throw new Response("Product terms not found", { status: 404 });
  }

  return product;
}

export function ProductTermsContent({ product }: { product: Product }) {
  const terms = product.presentation.terms;

  if (!terms) {
    throw new Response("Product terms not found", { status: 404 });
  }

  return (
    <ProductPageFrame product={product}>
      <PageHeader
        title={`${product.name} Terms of Service`}
        description={product.shortDescription}
        variant="document"
      />
      <DocumentPage>
        {createElement(getProductMdxContent(terms.contentKey), {
          components: productMdxComponents,
        })}
      </DocumentPage>
    </ProductPageFrame>
  );
}

export default function ProductTermsRoute({ params }: Route.ComponentProps) {
  const product = getProductTermsProduct(params.slug);

  return <ProductTermsContent product={product} />;
}
