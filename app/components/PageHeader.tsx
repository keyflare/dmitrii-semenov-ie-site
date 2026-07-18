import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  eyebrowAlign = "start",
  icon,
  id,
  title,
  description,
  variant = "poster",
}: {
  eyebrow?: string;
  eyebrowAlign?: "start" | "end";
  icon?: ReactNode;
  id?: string;
  title: ReactNode;
  description?: string;
  variant?: "poster" | "document";
}) {
  const eyebrowAlignClass = eyebrowAlign === "end" ? styles.eyebrowEnd : styles.eyebrowStart;
  const titleLockupClassName = icon
    ? `${styles.titleLockup} ${styles.titleLockupWithIcon}`
    : styles.titleLockup;
  const titleClassName = icon ? `${styles.title} ${styles.titleWithIcon}` : styles.title;

  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      <div className={titleLockupClassName}>
        {eyebrow ? <div className={`${styles.eyebrow} ${eyebrowAlignClass}`}>{eyebrow}</div> : null}
        <h1 id={id} className={titleClassName}>
          {icon ? (
            <>
              {icon}
              <span className={styles.titleText}>{title}</span>
            </>
          ) : (
            title
          )}
        </h1>
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
