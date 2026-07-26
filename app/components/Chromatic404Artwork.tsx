import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  INITIAL_PLATE_OFFSETS,
  arePlatesAligned,
  clampPlateOffset,
  getAmbientOffsets,
  getPlateZIndices,
  type PlateName,
  type PlateOffsets,
  type Point,
} from "./Chromatic404Artwork.logic";
import styles from "./Chromatic404Artwork.module.css";

export type Chromatic404ArtworkHandle = {
  reset(): void;
};

type Chromatic404ArtworkProps = {
  onAlignmentChange(aligned: boolean): void;
};

type ActiveDrag = {
  plate: PlateName;
  pointerId: number;
  pointerStart: Point;
  plateStart: Point;
};

const plateNames = ["red", "amber", "blue"] as const;
const zeroOffsets: PlateOffsets = {
  red: { x: 0, y: 0 },
  amber: { x: 0, y: 0 },
  blue: { x: 0, y: 0 },
};

function cloneInitialOffsets(): PlateOffsets {
  return {
    red: { ...INITIAL_PLATE_OFFSETS.red },
    amber: { ...INITIAL_PLATE_OFFSETS.amber },
    blue: { ...INITIAL_PLATE_OFFSETS.blue },
  };
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

export const Chromatic404Artwork = forwardRef<Chromatic404ArtworkHandle, Chromatic404ArtworkProps>(
  function Chromatic404Artwork({ onAlignmentChange }, ref) {
    const [plateOffsets, setPlateOffsets] = useState<PlateOffsets>(cloneInitialOffsets);
    const [ambientOffsets, setAmbientOffsets] = useState<PlateOffsets>(zeroOffsets);
    const [activePlate, setActivePlate] = useState<PlateName | null>(null);
    const [aligned, setAligned] = useState(false);
    const plateOffsetsRef = useRef(plateOffsets);
    const activeDragRef = useRef<ActiveDrag | null>(null);
    const reducedMotion = usePrefersReducedMotion();
    const plateZIndices = getPlateZIndices(plateOffsets);

    const updatePlateOffsets = useCallback((nextOffsets: PlateOffsets) => {
      plateOffsetsRef.current = nextOffsets;
      setPlateOffsets(nextOffsets);
    }, []);

    const reset = useCallback(() => {
      activeDragRef.current = null;
      setActivePlate(null);
      setAmbientOffsets(zeroOffsets);
      updatePlateOffsets(cloneInitialOffsets());
      setAligned(false);
      onAlignmentChange(false);
    }, [onAlignmentChange, updatePlateOffsets]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const alignPlates = useCallback(() => {
      activeDragRef.current = null;
      setActivePlate(null);
      setAmbientOffsets(zeroOffsets);
      updatePlateOffsets(zeroOffsets);
      setAligned(true);
      onAlignmentChange(true);
    }, [onAlignmentChange, updatePlateOffsets]);

    const handlePlatePointerDown = (
      plate: PlateName,
      event: ReactPointerEvent<HTMLSpanElement>,
    ) => {
      if (reducedMotion || aligned) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activeDragRef.current = {
        plate,
        pointerId: event.pointerId,
        pointerStart: { x: event.clientX, y: event.clientY },
        plateStart: plateOffsetsRef.current[plate],
      };
      setActivePlate(plate);
      setAmbientOffsets(zeroOffsets);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotion || aligned) {
        return;
      }

      const activeDrag = activeDragRef.current;

      if (activeDrag?.pointerId === event.pointerId) {
        const nextPoint = clampPlateOffset({
          x: activeDrag.plateStart.x + event.clientX - activeDrag.pointerStart.x,
          y: activeDrag.plateStart.y + event.clientY - activeDrag.pointerStart.y,
        });
        const nextOffsets: PlateOffsets = {
          ...plateOffsetsRef.current,
          [activeDrag.plate]: nextPoint,
        };

        if (arePlatesAligned(nextOffsets)) {
          alignPlates();
        } else {
          updatePlateOffsets(nextOffsets);
        }

        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      setAmbientOffsets(getAmbientOffsets(normalizedX, normalizedY));
    };

    const finishPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeDrag = activeDragRef.current;

      if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      activeDragRef.current = null;
      setActivePlate(null);
    };

    const clearAmbientMotion = () => {
      if (!activeDragRef.current) {
        setAmbientOffsets(zeroOffsets);
      }
    };

    return (
      <div
        className={`${styles.artwork} ${aligned ? styles.aligned : ""}`}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerInteraction}
        onPointerCancel={finishPointerInteraction}
        onPointerLeave={clearAmbientMotion}
        role="img"
        aria-label="Error 404 shown as misregistered chromatic printing plates"
      >
        <span className={styles.semanticCode}>404</span>
        <div className={styles.registrationFrame} aria-hidden="true">
          <span className={`${styles.registrationMark} ${styles.topLeft}`} />
          <span className={`${styles.registrationMark} ${styles.topRight}`} />
          <span className={`${styles.registrationMark} ${styles.bottomLeft}`} />
          <span className={`${styles.registrationMark} ${styles.bottomRight}`} />
        </div>
        <div className={styles.layers}>
          {plateNames.map((plate) => {
            const plateOffset = plateOffsets[plate];
            const ambientOffset = ambientOffsets[plate];
            const plateStyle = {
              "--plate-x": `${plateOffset.x}px`,
              "--plate-y": `${plateOffset.y}px`,
              "--ambient-x": `${ambientOffset.x}px`,
              "--ambient-y": `${ambientOffset.y}px`,
              zIndex: activePlate === plate ? 6 : plateZIndices[plate],
            } as CSSProperties;

            return (
              <span
                aria-hidden="true"
                className={`${styles.plate} ${styles[plate]} ${
                  activePlate === plate ? styles.dragging : ""
                }`}
                data-plate={plate}
                key={plate}
                onPointerDown={(event) => handlePlatePointerDown(plate, event)}
                style={plateStyle}
              >
                404
              </span>
            );
          })}
        </div>
        <div className={styles.successBand} aria-hidden="true" />
        <div className={styles.statusStamp} aria-hidden="true">
          {aligned ? "Reality restored" : "Out of register"}
        </div>
        <div className={styles.dragHint} aria-hidden="true">
          {reducedMotion ? "Static edition" : aligned ? "In register" : "Drag the colour plates"}
        </div>
        <div className={styles.ruler} aria-hidden="true" />
      </div>
    );
  },
);
