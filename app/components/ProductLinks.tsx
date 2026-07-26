import { Link } from "react-router";
import type { Product, ProductPlatform } from "~/content/products/types";
import styles from "./ProductLinks.module.css";

const platformLabels: Record<ProductPlatform, string> = {
  android: "Android",
  ios: "iOS",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  web: "Web",
};

export function ProductLinks({ product }: { product: Product }) {
  const isInDevelopment = product.releaseStage === "in-development";
  const storeLinks = isInDevelopment
    ? []
    : Object.entries(product.storeLinks)
        .filter((entry): entry is [ProductPlatform, string] => {
          const href = entry[1];

          return typeof href === "string" && href.trim() !== "";
        })
        .map(([platform, href]) => [platform, href.trim()] as const);

  const linkedPlatforms = new Set(storeLinks.map(([platform]) => platform));
  const comingSoonPlatforms = isInDevelopment
    ? []
    : product.platforms.filter((platform) => !linkedPlatforms.has(platform));

  return (
    <nav className={styles.links} aria-label={`${product.name} links`}>
      <Link className={styles.primaryLink} to={`/products/${product.slug}/`}>
        Overview
      </Link>
      <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
      {product.presentation.terms ? (
        <Link to={`/products/${product.slug}/terms/`}>Terms</Link>
      ) : null}
      <Link to={`/products/${product.slug}/support/`}>Support</Link>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <Link to={`/products/${product.slug}/data-deletion/`}>Data deletion</Link>
      ) : null}
      {storeLinks.map(([platform, href]) => (
        <a key={platform} href={href} rel="noreferrer" target="_blank">
          {platformLabels[platform]}
        </a>
      ))}
      {isInDevelopment ? (
        <span className={styles.comingSoon}>
          In development ·{" "}
          {product.platforms.map((platform) => platformLabels[platform]).join(" / ")}
        </span>
      ) : null}
      {comingSoonPlatforms.map((platform) => (
        <span key={platform} className={styles.comingSoon}>
          {platformLabels[platform]} coming soon
        </span>
      ))}
    </nav>
  );
}
