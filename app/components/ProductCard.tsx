import { Link } from "react-router";
import type { Product } from "~/content/products/types";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{product.name}</h2>
      <p className={styles.description}>{product.shortDescription}</p>
      <div className={styles.links}>
        <Link to={`/products/${product.slug}/`}>Overview</Link>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </div>
    </article>
  );
}
