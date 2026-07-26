export type PlateName = "red" | "amber" | "blue";
export type Point = { x: number; y: number };
export type PlateOffsets = Record<PlateName, Point>;

export const INITIAL_PLATE_OFFSETS: PlateOffsets = {
  red: { x: -24, y: -9 },
  amber: { x: 20, y: 11 },
  blue: { x: 0, y: 0 },
};

const dragLimit = 48;
const snapDistance = 9;

export function clampPlateOffset(point: Point): Point {
  return {
    x: Math.max(-dragLimit, Math.min(dragLimit, point.x)),
    y: Math.max(-dragLimit, Math.min(dragLimit, point.y)),
  };
}

export function getAmbientOffsets(normalizedX: number, normalizedY: number): PlateOffsets {
  return {
    red: { x: normalizedX * -8, y: normalizedY * -8 },
    amber: { x: normalizedX * 6, y: normalizedY * 6 },
    blue: { x: normalizedX * -2, y: normalizedY * -2 },
  };
}

export function arePlatesAligned(offsets: PlateOffsets): boolean {
  return Object.values(offsets).every(({ x, y }) => Math.hypot(x, y) < snapDistance);
}
