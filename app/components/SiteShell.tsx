import { Link } from "react-router";
import { siteConfig } from "~/content/site";
import { StudioLogo } from "./StudioLogo";
import styles from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.nav}`}>
          <Link className={styles.brand} to="/" aria-label={`${siteConfig.brandName} home`}>
            <StudioLogo className={styles.brandLogo} />
            <span className={styles.brandName}>{siteConfig.brandName}</span>
          </Link>
          <nav className={styles.links} aria-label="Main navigation">
            <Link to="/products/">Products</Link>
            <Link to="/about/">About</Link>
            <Link to="/legal/">Legal</Link>
            <Link to="/contact/">Contact</Link>
          </nav>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerContent}`}>
          <div>
            <strong>{siteConfig.brandName}</strong>
            <p>Software for mobile, desktop, TV, and whatever comes next.</p>
          </div>
          <div className={styles.legal}>
            <p>© 2026 {siteConfig.brandName}.</p>
            <p>Operated by Dmitrii Semenov IE.</p>
            <p>Republic of Armenia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
