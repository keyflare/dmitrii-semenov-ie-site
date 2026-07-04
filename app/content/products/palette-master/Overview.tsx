import type { CSSProperties } from "react";
import { PageHeader } from "~/components/PageHeader";
import { ProductLinks } from "~/components/ProductLinks";
import type { CustomProductOverviewProps } from "../customOverviewPages";
import styles from "./Overview.module.css";

export function PaletteMasterOverview({ product }: CustomProductOverviewProps) {
  const themeStyle = product.theme
    ? ({
        "--product-accent-primary": product.theme.accentPrimary,
        "--product-accent-secondary": product.theme.accentSecondary,
        "--product-accent-tertiary": product.theme.accentTertiary,
        "--product-surface": product.theme.surface,
        "--product-gradient": product.theme.gradient,
      } as CSSProperties)
    : undefined;

  return (
    <article className={styles.overview} style={themeStyle}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <PageHeader
            eyebrow="Mobile game"
            title={product.name}
            description="A color-focused mobile puzzle game with poster-bright energy."
          />
          <ProductLinks product={product} />
        </div>
        <div className={styles.media} aria-label="Palette Master color tiles">
          <div className={styles.tile} />
          <div className={styles.tile} />
          <div className={styles.tile} />
        </div>
      </section>
      <section className={styles.details}>
        <div className={styles.detail}>
          <h2>Match</h2>
          <p>Read color relationships quickly and solve compact visual puzzles.</p>
        </div>
        <div className={styles.detail}>
          <h2>Shift</h2>
          <p>Move through palettes, contrast, and rhythm without losing the board.</p>
        </div>
        <div className={styles.detail}>
          <h2>Clear</h2>
          <p>Designed as a bright mobile game surface for iOS and Android.</p>
        </div>
      </section>
    </article>
  );
}
