import type { CSSProperties, ReactNode } from "react";
import type { Product } from "~/content/products/types";
import styles from "./ProductPageFrame.module.css";

export function ProductPageFrame({ children, product }: { children: ReactNode; product: Product }) {
  const style = product.theme
    ? ({
        "--product-page-accent": product.theme.accentPrimary,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={styles.frame}
      data-page-surface={product.theme?.pageSurface}
      data-product={product.slug}
      style={style}
    >
      {children}
    </div>
  );
}
