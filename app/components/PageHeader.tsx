import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export function PageHeader({
  allowTitleWrap = false,
  eyebrow,
  eyebrowAlign = "start",
  icon,
  id,
  title,
  description,
  variant = "poster",
}: {
  allowTitleWrap?: boolean;
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
  const titleClassName = [
    styles.title,
    icon ? styles.titleWithIcon : null,
    allowTitleWrap ? styles.titleAllowWrap : styles.titleNoWrap,
  ]
    .filter(Boolean)
    .join(" ");

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
