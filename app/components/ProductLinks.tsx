import { Link } from "react-router";
import type { Product } from "~/content/products/types";
import styles from "./ProductLinks.module.css";

export function ProductLinks({ product }: { product: Product }) {
  const storeLinks = Object.entries(product.storeLinks)
    .filter((entry): entry is [string, string] => {
      const href = entry[1];

      return typeof href === "string" && href.trim() !== "";
    })
    .map(([platform, href]) => [platform, href.trim()] as const);

  return (
    <nav className={styles.links} aria-label={`${product.name} links`}>
      <Link className={styles.primaryLink} to={`/products/${product.slug}/`}>
        Overview
      </Link>
      <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
      <Link to={`/products/${product.slug}/support/`}>Support</Link>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <Link to={`/products/${product.slug}/data-deletion/`}>Data deletion</Link>
      ) : null}
      {storeLinks.map(([platform, href]) => (
        <a key={platform} href={href} rel="noreferrer" target="_blank">
          {platform}
        </a>
      ))}
    </nav>
  );
}
