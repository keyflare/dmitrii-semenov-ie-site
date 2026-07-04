import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { CustomProductOverviewProps } from "../customOverviewPages";
import styles from "./Overview.module.css";

const playStoreUrl =
  "https://play.google.com/store/apps/details?id=com.keyflare.palettemaster&hl=en";

const feedbackUrl = "mailto:semdm.am@gmail.com?subject=Palette%20Master%20feedback";

const screenshots = [
  {
    src: "/products/palette-master/screenshots/palette-master-01.png",
    alt: "Palette Master puzzle level with a broken color gradient",
  },
  {
    src: "/products/palette-master/screenshots/palette-master-02.png",
    alt: "Palette Master level selection and progress screen",
  },
  {
    src: "/products/palette-master/screenshots/palette-master-03.png",
    alt: "Palette Master gameplay with bright draggable tiles",
  },
  {
    src: "/products/palette-master/screenshots/palette-master-04.png",
    alt: "Palette Master completed palette preview",
  },
  {
    src: "/products/palette-master/screenshots/palette-master-05.png",
    alt: "Palette Master hint and puzzle controls",
  },
  {
    src: "/products/palette-master/screenshots/palette-master-06.png",
    alt: "Palette Master dark theme gameplay screen",
  },
];

const facts = [
  ["200+ levels", "Hand-sized gradient puzzles that grow more demanding as you progress."],
  [
    "Offline single-player",
    "Play anywhere, at your own pace, without accounts or social pressure.",
  ],
  ["No timers", "Experiment freely. Mistakes are part of reading the palette."],
  ["Hints included", "Reveal a correct tile or lock the pieces that already belong."],
];

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
          <div className={styles.kicker}>
            <span>Mobile Game</span>
            <span>Android</span>
            <strong>iOS Coming Soon</strong>
          </div>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.tagline}>
            An offline color puzzle game about rebuilding broken gradients tile by tile.
          </p>
          <p className={styles.lede}>
            Slide pieces into place, trust your eye for hue, and turn scattered color fields back
            into smooth palettes. It is calm enough for a break and sharp enough to keep your brain
            awake.
          </p>
          <nav className={styles.heroLinks} aria-label="Palette Master links">
            <Link className={styles.primaryLink} to={`/products/${product.slug}/`}>
              Overview
            </Link>
            <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
            <Link to={`/products/${product.slug}/support/`}>Support</Link>
            <a className={styles.feedbackLink} href={feedbackUrl}>
              Send feedback
            </a>
          </nav>
        </div>
        <div className={styles.media} aria-label="Palette Master screenshots">
          <img
            className={styles.heroShot}
            src={screenshots[2].src}
            alt={screenshots[2].alt}
            loading="eager"
          />
          <img
            className={styles.heroShot}
            src={screenshots[5].src}
            alt={screenshots[5].alt}
            loading="eager"
          />
        </div>
      </section>
      <section className={styles.platformPanel} aria-label="Platform availability">
        <a className={styles.platformCard} href={playStoreUrl} rel="noreferrer" target="_blank">
          <img
            className={styles.storeLogo}
            src="/products/palette-master/store-icons/google-play.svg"
            alt="Google Play logo"
            loading="lazy"
          />
          <span className={styles.platformCopy}>
            <span>Available now</span>
            <strong>Android · Google Play</strong>
          </span>
        </a>
        <div className={`${styles.platformCard} ${styles.comingSoonCard}`}>
          <img
            className={styles.storeLogo}
            src="/products/palette-master/store-icons/app-store.svg"
            alt="App Store logo"
            loading="lazy"
          />
          <span className={styles.platformCopy}>
            <span>Coming soon</span>
            <strong>iOS · App Store</strong>
          </span>
        </div>
      </section>
      <section className={styles.details} aria-label="Gameplay highlights">
        {facts.map(([title, body]) => (
          <div key={title} className={styles.detail}>
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </section>
      <section className={styles.gallery} aria-label="Palette Master screenshots">
        <div className={styles.galleryHeader}>
          <p>Inside the puzzle</p>
          <h2>Color, contrast, and tiny victories</h2>
        </div>
        <div className={styles.screenshotGrid}>
          {screenshots.map((screenshot) => (
            <img
              key={screenshot.src}
              className={styles.screenshot}
              src={screenshot.src}
              alt={screenshot.alt}
              loading="lazy"
            />
          ))}
        </div>
      </section>
      <section className={styles.feedback} aria-label="Palette Master feedback">
        <div>
          <p>Found a rough edge or have a color puzzle idea?</p>
          <h2>Tell us what should shift next.</h2>
        </div>
        <a href={feedbackUrl}>Write to support</a>
      </section>
    </article>
  );
}
