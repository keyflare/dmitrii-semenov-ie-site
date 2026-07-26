import { PosterButton } from "./PosterButton";
import styles from "./GenericErrorPage.module.css";

export function GenericErrorPage() {
  return (
    <>
      <title>Something went wrong | Keyflare Studio</title>
      <meta name="robots" content="noindex, follow" />
      <section className={styles.page} aria-labelledby="generic-error-title">
        <p className={styles.eyebrow}>STUDIO SYSTEM / ERROR</p>
        <h1 id="generic-error-title">Something went wrong.</h1>
        <p>
          The studio hit an unexpected fault. Return home and try the route again when you are
          ready.
        </p>
        <PosterButton to="/" size="hero" tone="primary">
          Return home
        </PosterButton>
      </section>
    </>
  );
}
