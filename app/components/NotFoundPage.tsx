import { useRef, useState } from "react";
import { PosterButton } from "./PosterButton";
import { TearOff404Artwork, type TearOff404ArtworkHandle } from "./TearOff404Artwork";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const [open, setOpen] = useState(false);
  const artworkRef = useRef<TearOff404ArtworkHandle>(null);

  const resetArtwork = () => {
    artworkRef.current?.reset();
  };

  return (
    <>
      <title>404 - Page not found | Keyflare Studio</title>
      <meta name="robots" content="noindex, follow" />
      <section className={styles.page} aria-labelledby="not-found-title">
        <header className={styles.intro}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>ERROR EDITION / 404</p>
            <h1 id="not-found-title">
              {open ? "Nothing underneath either." : "This page isn’t here."}
            </h1>
          </div>
          <p className={styles.summary} aria-live="polite">
            {open
              ? "Still missing. At least the exits work."
              : "Pull the error print aside—or use a working exit."}
          </p>
        </header>
        <TearOff404Artwork ref={artworkRef} onOpenChange={setOpen} />
        <footer className={styles.utility}>
          <div className={styles.actions}>
            <PosterButton to="/" size="hero" tone="primary">
              Return home
            </PosterButton>
            <PosterButton to="/products/" size="hero">
              View products
            </PosterButton>
            {open ? (
              <button className={styles.resetButton} type="button" onClick={resetArtwork}>
                Print it again
              </button>
            ) : null}
          </div>
          <div className={styles.productionNote}>
            <strong>404 / Tear-off edition</strong>
            <span>Missing route · working exits</span>
          </div>
        </footer>
      </section>
    </>
  );
}
