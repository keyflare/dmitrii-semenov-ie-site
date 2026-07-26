import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  TEAR_START_PROGRESS,
  getTearProgress,
  shouldCompleteTear,
} from "./TearOff404Artwork.logic";
import styles from "./TearOff404Artwork.module.css";

export type TearOff404ArtworkHandle = {
  reset(): void;
};

type TearOff404ArtworkProps = {
  onOpenChange(open: boolean): void;
};

type ActiveDrag = {
  pointerId: number;
  startClientX: number;
  startProgress: number;
  artworkWidth: number;
  handle: HTMLButtonElement;
  moved: boolean;
};

const dragClickThreshold = 4;

export const TearOff404Artwork = forwardRef<TearOff404ArtworkHandle, TearOff404ArtworkProps>(
  function TearOff404Artwork({ onOpenChange }, ref) {
    const [progress, setProgress] = useState(TEAR_START_PROGRESS);
    const [dragging, setDragging] = useState(false);
    const [open, setOpen] = useState(false);
    const progressRef = useRef(progress);
    const activeDragRef = useRef<ActiveDrag | null>(null);
    const suppressClickRef = useRef(false);

    const updateProgress = useCallback((nextProgress: number) => {
      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }, []);

    const openPoster = useCallback(() => {
      activeDragRef.current = null;
      setDragging(false);
      updateProgress(1);
      setOpen(true);
      onOpenChange(true);
    }, [onOpenChange, updateProgress]);

    const reset = useCallback(() => {
      activeDragRef.current = null;
      suppressClickRef.current = false;
      setDragging(false);
      updateProgress(TEAR_START_PROGRESS);
      setOpen(false);
      onOpenChange(false);
    }, [onOpenChange, updateProgress]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (open) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const artwork = event.currentTarget.closest<HTMLElement>("[data-tear-artwork]");

      activeDragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startProgress: progressRef.current,
        artworkWidth: artwork?.getBoundingClientRect().width ?? 0,
        handle: event.currentTarget,
        moved: false,
      };
      suppressClickRef.current = false;
      setDragging(true);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeDrag = activeDragRef.current;

      if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
        return;
      }

      const pointerDelta = event.clientX - activeDrag.startClientX;
      if (Math.abs(pointerDelta) >= dragClickThreshold) {
        activeDrag.moved = true;
      }

      updateProgress(
        getTearProgress({
          startProgress: activeDrag.startProgress,
          startClientX: activeDrag.startClientX,
          currentClientX: event.clientX,
          artworkWidth: activeDrag.artworkWidth,
        }),
      );
    };

    const finishPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeDrag = activeDragRef.current;

      if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
        return;
      }

      if (activeDrag.handle.hasPointerCapture(event.pointerId)) {
        activeDrag.handle.releasePointerCapture(event.pointerId);
      }

      activeDragRef.current = null;
      suppressClickRef.current = activeDrag.moved;
      setDragging(false);

      if (shouldCompleteTear(progressRef.current)) {
        openPoster();
      } else {
        updateProgress(TEAR_START_PROGRESS);
      }
    };

    const cancelPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeDrag = activeDragRef.current;

      if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
        return;
      }

      if (activeDrag.handle.hasPointerCapture(event.pointerId)) {
        activeDrag.handle.releasePointerCapture(event.pointerId);
      }

      activeDragRef.current = null;
      suppressClickRef.current = activeDrag.moved;
      setDragging(false);
      updateProgress(TEAR_START_PROGRESS);
    };

    const handleClick = () => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }

      openPoster();
    };

    const artworkStyle = {
      "--tear-position": `${progress * 100}%`,
    } as CSSProperties;

    return (
      <div className={styles.stage}>
        <div
          aria-label={
            open
              ? "Error 404 revealed beneath a removed poster"
              : "Error poster with a pull handle that reveals error 404"
          }
          className={`${styles.artwork} ${dragging ? styles.dragging : ""} ${
            open ? styles.open : ""
          }`}
          data-tear-artwork
          onPointerCancel={cancelPointerInteraction}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerInteraction}
          role="group"
          style={artworkStyle}
        >
          <div className={styles.reveal} aria-hidden="true">
            <span className={styles.revealMeta}>PAGE UNDER THIS PAGE / 00404</span>
            <span className={styles.code}>404</span>
            <span className={styles.revealBand}>MISSING / BUT NAVIGABLE</span>
            <span className={styles.revealNote}>THE ROUTE ENDS HERE. THE SITE DOESN’T.</span>
            <span className={`${styles.registrationMark} ${styles.topLeft}`} />
            <span className={`${styles.registrationMark} ${styles.topRight}`} />
            <span className={`${styles.registrationMark} ${styles.bottomLeft}`} />
            <span className={`${styles.registrationMark} ${styles.bottomRight}`} />
          </div>

          {open ? null : (
            <>
              <div className={styles.errorSheet} aria-hidden="true">
                <span className={styles.errorStamp}>ROUTE VOID</span>
                <span className={styles.sheetIndex}>ERROR SHEET / REMOVE TO INSPECT</span>
                <span className={styles.sheetTitle}>
                  NOTHING
                  <br />
                  PRINTED
                  <br />
                  HERE
                </span>
                <span className={styles.sheetRule} />
                <span className={styles.sheetFoot}>KEYFLARE STUDIO · MISPRINT 00404</span>
              </div>
              <span className={styles.tearLine} aria-hidden="true" />
              <span className={styles.directionHint} aria-hidden="true">
                TEAR HERE
              </span>
              <button
                aria-label="Tear away the error poster"
                className={styles.pullHandle}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                type="button"
              >
                <span aria-hidden="true">PULL →</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  },
);
