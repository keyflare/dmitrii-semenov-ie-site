import type { MDXComponents } from "mdx/types";
import styles from "./mdxComponents.module.css";

export const productMdxComponents: MDXComponents = {
  h2: (props) => <h2 className={styles.heading2} {...props} />,
  h3: (props) => <h3 className={styles.heading3} {...props} />,
  p: (props) => <p className={styles.paragraph} {...props} />,
  ul: (props) => <ul className={styles.list} {...props} />,
  ol: (props) => <ol className={styles.list} {...props} />,
  li: (props) => <li className={styles.item} {...props} />,
  a: (props) => <a className={styles.link} {...props} />,
};
