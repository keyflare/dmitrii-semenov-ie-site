import type { Route } from "./+types/product-privacy";
import { PageHeader } from "~/components/PageHeader";
import { findPublishedProduct } from "~/content/products/registry";
import { getPrivacySections } from "~/content/products/privacyBlocks";
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

export default function ProductPrivacyRoute({ params }: Route.ComponentProps) {
  const product = findPublishedProduct(params.slug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  const sections = getPrivacySections(product);

  return (
    <>
      <PageHeader title={`${product.name} Privacy Policy`} description={product.shortDescription} />
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </>
  );
}
