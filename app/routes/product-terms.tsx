import { findPublishedProduct } from "~/content/products/registry";

export function getProductTermsProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product?.presentation.terms) {
    throw new Response("Product terms not found", { status: 404 });
  }

  return product;
}

export default function ProductTermsRoute() {
  return null;
}
