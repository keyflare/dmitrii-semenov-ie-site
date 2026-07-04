import type { Product } from "~/content/products/types";
import { ProductLinks } from "./ProductLinks";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <div className={styles.marker}>{product.type}</div>
      <h2 className={styles.title}>{product.name}</h2>
      <p className={styles.description}>{product.shortDescription}</p>
      <div className={styles.meta}>{product.platforms.join(" / ")}</div>
      <ProductLinks product={product} />
    </article>
  );
}
