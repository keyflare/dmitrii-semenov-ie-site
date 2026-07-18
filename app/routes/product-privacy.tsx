import { createElement } from "react";
import type { Route } from "./+types/product-privacy";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { getProductMdxContent } from "~/content/products/customMdxContent";
import { productMdxComponents } from "~/content/products/mdxComponents";
import { findPublishedProduct } from "~/content/products/registry";
import { getPrivacySections } from "~/content/products/privacyBlocks";
import type { Product } from "~/content/products/types";
import { siteConfig } from "~/content/site";

export const meta: Route.MetaFunction = ({ params }) => {
  const product = findPublishedProduct(params.slug);

  return [
    {
      title: product
        ? `${product.name} Privacy Policy - ${siteConfig.brandName}`
        : `Privacy Policy - ${siteConfig.brandName}`,
    },
    {
      name: "description",
      content: product ? `Privacy policy for ${product.name}.` : "Privacy policy.",
    },
  ];
};

export function getProductPrivacyProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return product;
}

export function ProductPrivacyContent({ product }: { product: Product }) {
  const sections = getPrivacySections(product);
  const privacy = product.presentation.privacy;
  const privacyMdx =
    privacy.mode === "mdx" || privacy.mode === "generated-with-mdx"
      ? createElement(getProductMdxContent(privacy.contentKey), {
          components: productMdxComponents,
        })
      : null;

  return (
    <>
      <PageHeader
        title={`${product.name} Privacy Policy`}
        description={product.shortDescription}
        variant="document"
      />
      <DocumentPage>
        {privacy.mode === "mdx"
          ? privacyMdx
          : sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
        {privacy.mode === "generated-with-mdx" ? privacyMdx : null}
      </DocumentPage>
    </>
  );
}

export default function ProductPrivacyRoute({ params }: Route.ComponentProps) {
  const product = getProductPrivacyProduct(params.slug);

  return <ProductPrivacyContent product={product} />;
}
