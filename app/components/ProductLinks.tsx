import { Link } from "react-router";
import { hasProductTerms, type Product, type ProductPlatform } from "~/content/products/types";
import styles from "./ProductLinks.module.css";

const platformLabels: Record<ProductPlatform, string> = {
  android: "Android",
  ios: "iOS",
  tvos: "Apple TV",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  web: "Web",
};

export function ProductLinks({ product }: { product: Product }) {
  const reloadDocument = Boolean(product.staticSite);
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
      <Link
        reloadDocument={reloadDocument}
        className={styles.primaryLink}
        to={`/products/${product.slug}/`}
      >
        Overview
      </Link>
      <Link reloadDocument={reloadDocument} to={`/products/${product.slug}/privacy/`}>
        Privacy
      </Link>
      {hasProductTerms(product) ? (
        <Link reloadDocument={reloadDocument} to={`/products/${product.slug}/terms/`}>
          Terms
        </Link>
      ) : null}
      <Link reloadDocument={reloadDocument} to={`/products/${product.slug}/support/`}>
        Support
      </Link>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <Link reloadDocument={reloadDocument} to={`/products/${product.slug}/data-deletion/`}>
          Data deletion
        </Link>
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
