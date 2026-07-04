import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  id,
  title,
  description,
  variant = "poster",
}: {
  eyebrow?: string;
  id?: string;
  title: string;
  description?: string;
  variant?: "poster" | "document";
}) {
  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
