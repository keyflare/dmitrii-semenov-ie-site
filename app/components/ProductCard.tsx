import { SiteLink as Link } from "~/components/SiteLink";
import { getProductCardModel } from "~/content/products/card";
import type { Product } from "~/content/products/types";
import { PosterButton } from "./PosterButton";
import { ProductCardMedia } from "./ProductCardMedia";
import { StoreIcon } from "./StoreIcon";
import styles from "./ProductCard.module.css";

export function ProductCard({
  product,
  headingLevel: Heading = "h2",
}: {
  product: Product;
  headingLevel?: "h2" | "h3";
}) {
  const { typeLabel, downloads, hasUnreleasedPlatforms } = getProductCardModel(product);
  const reloadDocument = Boolean(product.staticSite);

  return (
    <article
      className={styles.cardShell}
      data-product-card={product.slug}
      data-product-kind={product.type}
    >
      <Link
        reloadDocument={reloadDocument}
        className={styles.overviewLink}
        to={`/products/${product.slug}/`}
        aria-label={`Open ${product.name}`}
      />
      <div className={styles.card}>
        <ProductCardMedia media={product.cardMedia} productType={product.type} />
        <div className={styles.copy}>
          <div className={styles.marker}>{typeLabel}</div>
          <Heading className={styles.title}>
            <span className={styles.titleText} data-card-outline-copy="">
              {product.name}
            </span>
            {product.cardIcon && (
              <img
                className={styles.titleIcon}
                src={product.cardIcon.src}
                width={product.cardIcon.width}
                height={product.cardIcon.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
          </Heading>
          <p className={styles.description} data-card-outline-copy="">
            {product.shortDescription}
          </p>
          {hasUnreleasedPlatforms ? <div className={styles.status}>In development</div> : null}
          <nav className={styles.actions} aria-label={`${product.name} downloads`}>
            {downloads.map(({ platform, label, href }) => (
              <PosterButton
                key={platform}
                href={href}
                size="compact"
                target={href ? "_blank" : undefined}
                tone={href ? "default" : "disabled"}
                ariaLabel={href ? `${label} for ${product.name}` : undefined}
              >
                <StoreIcon platform={platform} />
                <span className={styles.storeLabel}>
                  <span>{label}</span>
                  {href ? null : <span className={styles.comingSoon}>Coming Soon</span>}
                </span>
              </PosterButton>
            ))}
          </nav>
        </div>
      </div>
    </article>
  );
}
