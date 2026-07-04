import styles from "./DocumentPage.module.css";

export function DocumentPage({ children }: { children: React.ReactNode }) {
  return <article className={styles.document}>{children}</article>;
}
