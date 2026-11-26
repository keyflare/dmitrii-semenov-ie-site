import { PosterButton } from "./PosterButton";
import styles from "./StudioHero.module.css";

/** The glass lives on the letter, so the overlap survives every canvas size. */
export function StudioHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.canvas}>
        <div className={styles.stage}>
          <div className={styles.geometry} aria-hidden="true">
            <span className={styles.circle} />
            <span className={styles.redSquare} />
            <span className={styles.spectrumField}>
              <span className={styles.spectrum}>
                <span className={styles.spectrumRed} />
                <span className={styles.spectrumAmber} />
                <span className={styles.spectrumMint} />
                <span className={styles.spectrumBlue} />
              </span>
            </span>
          </div>
          <h1 id="home-title" className={styles.title} aria-label="Tiny apps, loud ideas.">
            <span className={styles.tiny} aria-hidden="true">
              Tiny
            </span>
            <span className={styles.apps} aria-hidden="true">
              apps,
            </span>
            <span className={styles.loud} aria-hidden="true">
              loud
            </span>
            <span className={styles.ideas} aria-hidden="true">
              <span className={styles.glassLetter}>
                i<span className={styles.glass} data-hero-glass="true" />
              </span>
              <span className={styles.ideasRest}>deas.</span>
            </span>
          </h1>
        </div>
        <div className={styles.details}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>BY DMITRII SEMENOV</p>
            <p className={styles.description}>
              Software for mobile, desktop, TV, and whatever comes next.
            </p>
            <div className={styles.actions}>
              <PosterButton to="/products/" size="hero" tone="primary" raised>
                View products
              </PosterButton>
              <PosterButton to="/contact/" size="hero" raised>
                Contact studio
              </PosterButton>
            </div>
          </div>
          <span className={styles.blueBlock} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
