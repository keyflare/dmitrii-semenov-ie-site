import type { Route } from "./+types/product-data-deletion";
import { PageHeader } from "~/components/PageHeader";
import { findPublishedProduct } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: Route.MetaFunction = ({ params }) => {
  const product = findPublishedProduct(params.slug);

  return [
    {
      title: product
        ? `${product.name} Data Deletion - ${siteConfig.brandName}`
        : `Data Deletion - ${siteConfig.brandName}`,
    },
    {
      name: "description",
      content: product ? `Data deletion for ${product.name}.` : "Data deletion.",
    },
  ];
};

export default function ProductDataDeletionRoute({ params }: Route.ComponentProps) {
  const product = findPublishedProduct(params.slug);

  if (!product || !product.privacyProfile.requiresDataDeletionPage) {
    throw new Response("Data deletion page not found", { status: 404 });
  }

  return (
    <>
      <PageHeader
        title={`${product.name} Data Deletion`}
        description="Instructions for requesting deletion of product-related data."
      />
      <p>
        Send a deletion request to{" "}
        <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>.
      </p>
    </>
  );
}
