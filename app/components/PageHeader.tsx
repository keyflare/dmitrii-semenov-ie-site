import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  eyebrowAlign = "start",
  id,
  title,
  description,
  variant = "poster",
}: {
  eyebrow?: string;
  eyebrowAlign?: "start" | "end";
  id?: string;
  title: ReactNode;
  description?: string;
  variant?: "poster" | "document";
}) {
  const eyebrowAlignClass = eyebrowAlign === "end" ? styles.eyebrowEnd : styles.eyebrowStart;

  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      {eyebrow ? <div className={`${styles.eyebrow} ${eyebrowAlignClass}`}>{eyebrow}</div> : null}
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
