import { Link } from "react-router";
import type { Product, ProductPlatform } from "~/content/products/types";
import { PosterButton } from "./PosterButton";
import styles from "./ProductCard.module.css";

const platformLabels: Record<ProductPlatform, string> = {
  android: "Android",
  ios: "iOS",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  web: "Web",
};

const productPreviews: Partial<Record<Product["slug"], { alt: string; src: string }>> = {
  "palette-master": {
    src: "/products/palette-master/screenshots/palette-master-03.png",
    alt: "Palette Master gameplay preview",
  },
};

const productStoreIcons: Partial<
  Record<Product["slug"], Partial<Record<ProductPlatform, string>>>
> = {
  "palette-master": {
    android: "/products/palette-master/store-icons/google-play.svg",
    ios: "/products/palette-master/store-icons/app-store.svg",
  },
};

export function ProductCard({ product }: { product: Product }) {
  const preview = productPreviews[product.slug];
  const storeIcons = productStoreIcons[product.slug] ?? {};
  const feedbackUrl = `mailto:${product.supportEmail}?subject=${encodeURIComponent(
    `${product.name} feedback`,
  )}`;
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
  const renderPlatformActionLabel = (platform: ProductPlatform, suffix = "") => {
    const iconSrc = storeIcons[platform];

    return (
      <>
        {iconSrc ? <img src={iconSrc} alt="" loading="lazy" /> : null}
        {platformLabels[platform]}
        {suffix}
      </>
    );
  };

  return (
    <article className={styles.cardShell}>
      <Link
        className={styles.overviewLink}
        to={`/products/${product.slug}/`}
        aria-label={`Open ${product.name}`}
      />
      <div className={styles.card}>
        <div className={styles.copy}>
          <div className={styles.marker}>{product.type}</div>
          <h2 className={styles.title}>{product.name}</h2>
          <p className={styles.description}>{product.shortDescription}</p>
          <div className={styles.meta}>{product.platforms.join(" / ")}</div>
          <nav className={styles.actions} aria-label={`${product.name} quick links`}>
            <PosterButton href={feedbackUrl} size="compact" tone="primary">
              Send feedback
            </PosterButton>
            <PosterButton to={`/products/${product.slug}/privacy/`} size="compact">
              Privacy
            </PosterButton>
            {product.presentation.terms ? (
              <PosterButton to={`/products/${product.slug}/terms/`} size="compact">
                Terms
              </PosterButton>
            ) : null}
            <PosterButton to={`/products/${product.slug}/support/`} size="compact">
              Support
            </PosterButton>
            {product.privacyProfile.requiresDataDeletionPage ? (
              <PosterButton to={`/products/${product.slug}/data-deletion/`} size="compact">
                Data deletion
              </PosterButton>
            ) : null}
            {storeLinks.map(([platform, href]) => (
              <PosterButton
                key={platform}
                className={storeIcons[platform] ? styles.storeAction : undefined}
                href={href}
                size="compact"
                target="_blank"
              >
                {renderPlatformActionLabel(platform)}
              </PosterButton>
            ))}
            {isInDevelopment ? (
              <PosterButton size="compact" tone="disabled">
                In development ·{" "}
                {product.platforms.map((platform) => platformLabels[platform]).join(" / ")}
              </PosterButton>
            ) : null}
            {comingSoonPlatforms.map((platform) => (
              <PosterButton
                key={platform}
                className={storeIcons[platform] ? styles.storeAction : undefined}
                size="compact"
                tone="disabled"
              >
                {renderPlatformActionLabel(platform, " coming soon")}
              </PosterButton>
            ))}
          </nav>
        </div>
        {preview ? (
          <div className={styles.preview} aria-hidden="true">
            <img src={preview.src} alt={preview.alt} loading="lazy" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
