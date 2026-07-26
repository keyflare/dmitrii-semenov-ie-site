import { useRef, useState } from "react";
import { PosterButton } from "./PosterButton";
import { Chromatic404Artwork, type Chromatic404ArtworkHandle } from "./Chromatic404Artwork";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const [aligned, setAligned] = useState(false);
  const artworkRef = useRef<Chromatic404ArtworkHandle>(null);

  const resetArtwork = () => {
    artworkRef.current?.reset();
  };

  return (
    <>
      <title>404 - Page not found | Keyflare Studio</title>
      <meta name="robots" content="noindex, follow" />
      <section className={styles.page} aria-labelledby="not-found-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>ERROR EDITION / 404</p>
          <div className={styles.message} aria-live="polite">
            <h1 id="not-found-title">
              {aligned ? "Beautifully wrong." : "This page slipped out of register."}
            </h1>
            <p>
              {aligned
                ? "The page is still missing. The way home isn't."
                : "The address is real. The page isn't."}
            </p>
          </div>
          <div className={styles.actions}>
            <PosterButton to="/" size="hero" tone="primary">
              Return home
            </PosterButton>
            {aligned ? (
              <button className={styles.resetButton} type="button" onClick={resetArtwork}>
                Play again
              </button>
            ) : (
              <PosterButton to="/products/" size="hero">
                View products
              </PosterButton>
            )}
          </div>
          <div className={styles.registrationNote}>
            <strong>404 / Chromatic calibration</strong>
            <span>Missing route · working exits</span>
          </div>
        </div>
        <Chromatic404Artwork ref={artworkRef} onAlignmentChange={setAligned} />
      </section>
    </>
  );
}
