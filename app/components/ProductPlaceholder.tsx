import type { Product } from "~/content/products/types";
import styles from "./ProductPlaceholder.module.css";

/** Decorative stand-in. Replace this component with product media when it is ready. */
export function ProductPlaceholder({ kind }: { kind: Product["type"] }) {
  const variation = kind === "mobile-game" ? "tiles" : kind === "mobile-app" ? "disc" : "planes";
  return (
    <div
      className={`${styles.artwork} ${styles[variation]}`}
      data-product-placeholder="true"
      aria-hidden="true"
    >
      <span className={styles.corner} />
      <span className={styles.form} />
      <span className={styles.reflection} />
    </div>
  );
}
