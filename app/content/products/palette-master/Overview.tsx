import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import type { CustomProductOverviewProps } from "../customOverviewPages";
import styles from "./Overview.module.css";

const feedbackUrl = "mailto:support@keyflare.studio?subject=Palette%20Master%20feedback";

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

const carouselIntervalMs = 2000;
let carouselAutoplayRunId = 0;

export function PaletteMasterOverview({ product }: CustomProductOverviewProps) {
  const playStoreUrl = product.storeLinks.android;
  const appStoreUrl = product.storeLinks.ios;
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const activeScreenshotRef = useRef(0);
  const carouselTimerRef = useRef<number | undefined>(undefined);
  const carouselTimerGenerationRef = useRef(0);
  const scheduleCarouselAutoplayRef = useRef<() => void>(() => undefined);
  const lastCarouselInteractionAtRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const screenshotRefs = useRef<Array<HTMLDivElement | null>>([]);

  const themeStyle = product.theme
    ? ({
        "--product-accent-primary": product.theme.accentPrimary,
        "--product-accent-secondary": product.theme.accentSecondary,
        "--product-accent-tertiary": product.theme.accentTertiary,
        "--product-surface": product.theme.surface,
        "--product-gradient": product.theme.gradient,
      } as CSSProperties)
    : undefined;

  const scrollToScreenshot = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const wrappedIndex = (index + screenshots.length) % screenshots.length;
    const track = trackRef.current;
    const target = screenshotRefs.current[wrappedIndex];
    const firstScreenshot = screenshotRefs.current[0];

    activeScreenshotRef.current = wrappedIndex;
    lastCarouselInteractionAtRef.current = Date.now();
    setActiveScreenshot(wrappedIndex);

    if (!track || !target || !firstScreenshot) {
      return;
    }

    track.scrollTo({
      left: Math.max(0, target.offsetLeft - firstScreenshot.offsetLeft),
      behavior,
    });
  }, []);

  const scheduleCarouselAutoplay = useCallback(() => {
    if (carouselTimerRef.current !== undefined) {
      window.clearTimeout(carouselTimerRef.current);
      carouselTimerRef.current = undefined;
    }

    const generation = carouselTimerGenerationRef.current + 1;
    const runId = carouselAutoplayRunId + 1;
    carouselTimerGenerationRef.current = generation;
    carouselAutoplayRunId = runId;

    carouselTimerRef.current = window.setTimeout(() => {
      if (generation !== carouselTimerGenerationRef.current || runId !== carouselAutoplayRunId) {
        return;
      }

      if (Date.now() - lastCarouselInteractionAtRef.current >= carouselIntervalMs) {
        scrollToScreenshot(activeScreenshotRef.current + 1);
      }

      scheduleCarouselAutoplayRef.current();
    }, carouselIntervalMs);
  }, [scrollToScreenshot]);

  useEffect(() => {
    scheduleCarouselAutoplayRef.current = scheduleCarouselAutoplay;
  }, [scheduleCarouselAutoplay]);

  const restartCarouselAutoplay = useCallback(() => {
    lastCarouselInteractionAtRef.current = Date.now();
    scheduleCarouselAutoplay();
  }, [scheduleCarouselAutoplay]);

  const handleCarouselControl = useCallback(
    (index: number) => {
      scrollToScreenshot(index);
      restartCarouselAutoplay();
    },
    [restartCarouselAutoplay, scrollToScreenshot],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return undefined;
    }

    scheduleCarouselAutoplay();

    return () => {
      carouselTimerGenerationRef.current += 1;
      carouselAutoplayRunId += 1;

      if (carouselTimerRef.current !== undefined) {
        window.clearTimeout(carouselTimerRef.current);
        carouselTimerRef.current = undefined;
      }
    };
  }, [scheduleCarouselAutoplay]);

  return (
    <article className={styles.overview} style={themeStyle}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <div className={styles.kicker}>
            <span>Mobile Game</span>
            <span>Android</span>
            <strong>iOS</strong>
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
            <a className={styles.primaryLink} href={feedbackUrl}>
              Send feedback
            </a>
            <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
            <Link to={`/products/${product.slug}/support/`}>Support</Link>
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
        <a className={styles.platformCard} href={appStoreUrl} rel="noreferrer" target="_blank">
          <img
            className={styles.storeLogo}
            src="/products/palette-master/store-icons/app-store.svg"
            alt="App Store logo"
            loading="lazy"
          />
          <span className={styles.platformCopy}>
            <span>Available now</span>
            <strong>iOS · App Store</strong>
          </span>
        </a>
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
        <div className={styles.galleryTop}>
          <div className={styles.galleryHeader}>
            <p>Inside the puzzle</p>
            <h2>Color, contrast, and tiny victories</h2>
          </div>
          <div className={styles.carouselControls} aria-label="Screenshot carousel controls">
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => handleCarouselControl(activeScreenshot - 1)}
            >
              Prev
            </button>
            <span aria-live="polite">
              {activeScreenshot + 1} / {screenshots.length}
            </span>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => handleCarouselControl(activeScreenshot + 1)}
            >
              Next
            </button>
          </div>
        </div>
        <div className={styles.carouselFrame}>
          <div
            ref={trackRef}
            className={styles.carouselTrack}
            aria-label="Scrollable Palette Master screenshots"
          >
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.src}
                ref={(node) => {
                  screenshotRefs.current[index] = node;
                }}
                className={styles.screenshotSlide}
              >
                <img
                  className={styles.screenshot}
                  src={screenshot.src}
                  alt={screenshot.alt}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className={styles.edgeFade} aria-hidden="true" />
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
