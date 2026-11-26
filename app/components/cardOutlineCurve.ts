export type OutlinePoint = readonly [distance: number, opacity: number];
export type OutlineProfile = { widthPx: number; curve: readonly OutlinePoint[] };

export const maxOutlineWidth = 40;
export const defaultOutlineProfile: OutlineProfile = {
  widthPx: 20.9,
  curve: [
    [0, 1],
    [0.5, 0.2],
    [1, 0],
  ],
};

export function readOutlineProfile(source: string | null): OutlineProfile {
  if (!source) return defaultOutlineProfile;
  try {
    const { widthPx, curve } = JSON.parse(source) as Partial<OutlineProfile>;
    if (!(typeof widthPx === "number" && widthPx >= 0 && widthPx <= maxOutlineWidth)) {
      return defaultOutlineProfile;
    }
    if (!Array.isArray(curve) || curve.length < 2 || curve.length > 8) return defaultOutlineProfile;
    let lastDistance = -1;
    let lastOpacity = 1;
    for (const point of curve) {
      if (!Array.isArray(point) || point.length !== 2) return defaultOutlineProfile;
      const [distance, opacity] = point;
      if (typeof distance !== "number" || typeof opacity !== "number") return defaultOutlineProfile;
      if (!(distance >= 0 && distance <= 1 && distance > lastDistance))
        return defaultOutlineProfile;
      if (!(opacity >= 0 && opacity <= lastOpacity)) return defaultOutlineProfile;
      lastDistance = distance;
      lastOpacity = opacity;
    }
    if (curve[0][0] !== 0 || curve[0][1] !== 1 || lastDistance !== 1) return defaultOutlineProfile;
    return { widthPx, curve };
  } catch {
    return defaultOutlineProfile;
  }
}

/** A monotone cubic through the control points, shared by the editor and the artwork mask. */
export function outlineOpacityCurve(points: readonly OutlinePoint[]) {
  const widths = points.slice(1).map(([x], i) => x - points[i][0]);
  const secants = widths.map((width, i) => (points[i + 1][1] - points[i][1]) / width);
  const tangents = points.map((_, i) => {
    if (i === 0 || i === points.length - 1 || !secants[i - 1] || !secants[i]) return 0;
    const previousWeight = 2 * widths[i] + widths[i - 1];
    const nextWeight = widths[i] + 2 * widths[i - 1];
    return (
      (previousWeight + nextWeight) / (previousWeight / secants[i - 1] + nextWeight / secants[i])
    );
  });

  return (distance: number) => {
    if (distance <= 0) return 1;
    if (distance > 1) return 0;
    const end = points.findIndex(([x]) => x >= distance);
    const start = end - 1;
    const width = widths[start];
    const t = (distance - points[start][0]) / width;
    const t2 = t * t;
    const t3 = t2 * t;
    const low = points[end][1];
    const high = points[start][1];
    const value =
      (2 * t3 - 3 * t2 + 1) * high +
      (t3 - 2 * t2 + t) * width * tangents[start] +
      (-2 * t3 + 3 * t2) * low +
      (t3 - t2) * width * tangents[end];
    return Math.max(low, Math.min(high, value));
  };
}
