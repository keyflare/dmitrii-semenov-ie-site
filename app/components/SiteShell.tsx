import { useLocation } from "react-router";
import { SiteLink as Link } from "~/components/SiteLink";
import { siteConfig } from "~/content/site";
import { StudioLogo } from "./StudioLogo";
import styles from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const isHome = useLocation().pathname === "/";
  return (
    <div className={`${styles.shell} ${isHome ? styles.homeShell : ""}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.nav}`}>
          <Link className={styles.brand} to="/" aria-label={`${siteConfig.brandName} home`}>
            <StudioLogo asset="wordmark" className={styles.brandLogo} />
            <span className="sr-only">{siteConfig.brandName}</span>
          </Link>
          <nav className={styles.links} aria-label="Main navigation">
            <Link to="/products/">Products</Link>
            <Link to="/privacy/">Privacy</Link>
            <Link to="/legal/">Legal</Link>
            <Link to="/contact/">Contact</Link>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={styles.content}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerContent}`}>
          <div>
            <strong>{siteConfig.brandName}</strong>
            <p>Software for mobile, desktop, TV, and whatever comes next.</p>
          </div>
          <div className={styles.legal}>
            <p>© 2026 {siteConfig.brandName}.</p>
            <p>Operated by Dmitrii Semenov, IE.</p>
            <p>Republic of Armenia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
