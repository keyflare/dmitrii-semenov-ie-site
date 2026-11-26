/** Squared distance to the nearest ink sample, evaluated in two separable passes. */
export function glyphDistances(alpha: Uint8ClampedArray, width: number, height: number) {
  const distances = new Float32Array(alpha.length);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    let nearest = -Infinity;
    for (let x = 0; x < width; x++) {
      if (alpha[row + x] >= 128) nearest = x;
      distances[row + x] = (x - nearest) ** 2;
    }
    nearest = Infinity;
    for (let x = width - 1; x >= 0; x--) {
      if (alpha[row + x] >= 128) nearest = x;
      distances[row + x] = Math.min(distances[row + x], (x - nearest) ** 2);
    }
  }

  // The lower envelope of these parabolas gives the exact Euclidean distance on the sample grid.
  const rows = new Int32Array(height);
  const costs = new Float32Array(height);
  const switches = new Float64Array(height);
  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = 0; y < height; y++) {
      const cost = distances[y * width + x];
      if (!Number.isFinite(cost)) continue;
      let start = -Infinity;
      while (count > 0) {
        const last = count - 1;
        const row = rows[last];
        start = (cost - costs[last] + y ** 2 - row ** 2) / (2 * (y - row));
        if (start > switches[last]) break;
        count--;
      }
      rows[count] = y;
      costs[count] = cost;
      switches[count] = count === 0 ? -Infinity : start;
      count++;
    }
    let band = 0;
    for (let y = 0; y < height; y++) {
      const i = y * width + x;
      while (band + 1 < count && switches[band + 1] <= y) band++;
      // Partially covered samples retain their original subpixel edge. Solid and empty
      // samples use the half-sample boundary of the oversampled ink.
      const coverage = alpha[i] / 255;
      distances[i] =
        coverage > 0
          ? 0.5 - coverage
          : count > 0
            ? Math.sqrt((y - rows[band]) ** 2 + costs[band]) - 0.5
            : Infinity;
    }
  }
  return distances;
}

/** Composite the outward silhouette without painting through the same ink's antialiasing. */
export function outlineCutout(ink: number, silhouette: number, sampleCount: number) {
  return ink < sampleCount ? Math.max(0, (silhouette - ink) / (sampleCount - ink)) : 0;
}
