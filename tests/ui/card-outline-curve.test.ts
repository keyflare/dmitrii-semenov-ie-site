import { expect, test } from "vitest";
import {
  defaultOutlineProfile,
  outlineOpacityCurve,
  readOutlineProfile,
} from "../../app/components/cardOutlineCurve";
import { glyphDistances, outlineCutout } from "../../app/components/cardOutlineDistance";

test("a flat curve keeps its opacity until the specified edge", () => {
  const sample = outlineOpacityCurve([
    [0, 1],
    [1, 1],
  ]);
  expect(sample(0.999)).toBe(1);
  expect(sample(1)).toBe(1);
  expect(sample(1.001)).toBe(0);
});

test("the curve passes through its knots and decreases without overshooting", () => {
  const { curve } = defaultOutlineProfile;
  const sample = outlineOpacityCurve(curve);
  for (const [x, y] of curve) expect(sample(x)).toBeCloseTo(y);
  for (let i = 1; i <= 1000; i++)
    expect(sample(i / 1000)).toBeLessThanOrEqual(sample((i - 1) / 1000));
  expect(sample(1.01)).toBe(0);
});

test("distances to a point of ink are even in every direction and increase without gaps", () => {
  const size = 9;
  const alpha = new Uint8ClampedArray(size ** 2);
  alpha[4 * size + 4] = 255;
  const distances = glyphDistances(alpha, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      expect(distances[y * size + x]).toBeCloseTo(Math.hypot(x - 4, y - 4) - 0.5);
    }
  }
});

test("each sample uses its closest glyph and keeps partial ink's subpixel edge", () => {
  const alpha = new Uint8ClampedArray(7 * 7);
  alpha[1 * 7 + 1] = 255;
  alpha[5 * 7 + 3] = 255;
  alpha[5 * 7 + 4] = 64;
  const distances = glyphDistances(alpha, 7, 7);
  expect(distances[4 * 7 + 3]).toBeCloseTo(0.5);
  expect(distances[3 * 7 + 3]).toBeCloseTo(1.5);
  expect(distances[5 * 7 + 4]).toBeCloseTo(0.5 - 64 / 255);
});

test("cutout alpha composes with the matching ink without creating an extra rim", () => {
  const total = 4;
  const ink = 1.5;
  expect(outlineCutout(ink, ink, total)).toBe(0);
  expect(outlineCutout(ink, total, total)).toBe(1);
  const opacity = outlineCutout(ink, 2, total);
  expect(ink / total + opacity * (1 - ink / total)).toBeCloseTo(0.5);
});

test("invalid preview curves fall back to the card defaults", () => {
  expect(readOutlineProfile('{"widthPx":5,"curve":[[0,1],[0.4,0.2],[0.7,0.7],[1,0]]}')).toEqual(
    defaultOutlineProfile,
  );
  expect(readOutlineProfile('{"widthPx":0.25,"curve":[[0,1],[1,1]]}')).toEqual({
    widthPx: 0.25,
    curve: [
      [0, 1],
      [1, 1],
    ],
  });
});
