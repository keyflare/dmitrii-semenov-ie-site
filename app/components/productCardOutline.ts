import {
  maxOutlineWidth,
  outlineOpacityCurve,
  readOutlineProfile,
  type OutlineProfile,
} from "./cardOutlineCurve";
import { glyphDistances, outlineCutout } from "./cardOutlineDistance";

const profileAttribute = "data-card-outline-profile";
const curveResolution = 1024;

function measureLines(element: HTMLElement, artwork: DOMRect, baseline: number) {
  const node = element.firstChild;
  const text = node?.textContent;
  if (node?.nodeType !== Node.TEXT_NODE || !text) return [];

  const range = document.createRange();
  const lines: { start: number; end: number; top: number }[] = [];
  let offset = 0;
  for (const character of text) {
    const start = offset;
    offset += character.length;
    range.setStart(node, start);
    range.setEnd(node, offset);
    const bounds = range.getBoundingClientRect();
    if (bounds.width === 0) continue;
    const last = lines.at(-1);
    if (last?.top === bounds.top) last.end = offset;
    else lines.push({ start, end: offset, top: bounds.top });
  }

  return lines.map(({ start, end }) => {
    range.setStart(node, start);
    range.setEnd(node, end);
    const bounds = range.getBoundingClientRect();
    return {
      text: text.slice(start, end),
      x: bounds.left - artwork.left,
      y: bounds.top - artwork.top + bounds.height / 2 + baseline,
      width: bounds.width,
    };
  });
}

function drawCopy(context: CanvasRenderingContext2D, element: HTMLElement, artwork: DOMRect) {
  const { fontFamily, fontSize, fontStyle, fontWeight, letterSpacing } = getComputedStyle(element);
  context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
  context.letterSpacing = letterSpacing === "normal" ? "0px" : letterSpacing;
  const { fontBoundingBoxAscent, fontBoundingBoxDescent } = context.measureText("Mg");
  const baseline = (fontBoundingBoxAscent - fontBoundingBoxDescent) / 2;
  for (const { text, x, y, width } of measureLines(element, artwork, baseline)) {
    const advance = context.measureText(text).width;
    if (advance === 0) continue;
    context.save();
    context.translate(x, y);
    context.scale(width / advance, 1);
    context.fillText(text, 0, 0);
    context.restore();
  }
}

function measureArtwork(
  artwork: HTMLDivElement,
  copy: NodeListOf<HTMLElement>,
  downloads: HTMLElement | null | undefined,
  source: CanvasRenderingContext2D,
  ink: CanvasRenderingContext2D,
  mask: CanvasRenderingContext2D,
) {
  const bounds = artwork.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0) return;
  const pixelRatio = Math.max(1, Math.min(3, Math.ceil(window.devicePixelRatio || 1)));
  const samples = pixelRatio === 1 ? 3 : 2;
  const sampleCount = samples ** 2;
  const width = Math.ceil(bounds.width * pixelRatio);
  const height = Math.ceil(bounds.height * pixelRatio);
  const scaleX = width / bounds.width;
  const scaleY = height / bounds.height;
  const rectangles = Array.from(copy, (element) => element.getBoundingClientRect());
  const margin = maxOutlineWidth + 3;
  const x = Math.max(
    0,
    Math.floor((Math.min(...rectangles.map((r) => r.left)) - bounds.left - margin) * scaleX),
  );
  const y = Math.max(
    0,
    Math.floor((Math.min(...rectangles.map((r) => r.top)) - bounds.top - margin) * scaleY),
  );
  const right = Math.min(
    width,
    Math.ceil((Math.max(...rectangles.map((r) => r.right)) - bounds.left + margin) * scaleX),
  );
  const bottom = Math.min(
    height,
    Math.ceil((Math.max(...rectangles.map((r) => r.bottom)) - bounds.top + margin) * scaleY),
  );
  const fieldWidth = right - x;
  const fieldHeight = bottom - y;
  if (fieldWidth <= 0 || fieldHeight <= 0) return;

  ink.canvas.width = mask.canvas.width = width;
  ink.canvas.height = mask.canvas.height = height;
  const sampleWidth = fieldWidth * samples;
  const sampleHeight = fieldHeight * samples;
  source.canvas.width = sampleWidth;
  source.canvas.height = sampleHeight;
  source.setTransform(scaleX * samples, 0, 0, scaleY * samples, -x * samples, -y * samples);
  source.fillStyle = getComputedStyle(artwork.parentElement!).color;
  for (const element of copy) drawCopy(source, element, bounds);

  const rgba = source.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const coverage = new Uint8ClampedArray(sampleWidth * sampleHeight);
  for (let i = 0; i < coverage.length; i++) coverage[i] = rgba[i * 4 + 3];
  const colorSample = coverage.indexOf(255) * 4;
  if (colorSample < 0) return;
  const colors = rgba.subarray(colorSample, colorSample + 3);
  const inkPixels = ink.createImageData(fieldWidth, fieldHeight);
  const sampleRows = Array.from({ length: samples }, (_, row) => row * sampleWidth);
  for (let row = 0; row < fieldHeight; row++) {
    for (let column = 0; column < fieldWidth; column++) {
      const first = (row * sampleWidth + column) * samples;
      const pixel = (row * fieldWidth + column) * 4;
      let total = 0;
      for (const offset of sampleRows) {
        for (let i = 0; i < samples; i++) total += coverage[first + offset + i];
      }
      inkPixels.data.set(colors, pixel);
      inkPixels.data[pixel + 3] = total / sampleCount;
    }
  }
  ink.putImageData(inkPixels, x, y);
  source.canvas.width = source.canvas.height = 1;
  const distances = glyphDistances(coverage, sampleWidth, sampleHeight);
  const rail = downloads?.getBoundingClientRect();

  return {
    x,
    y,
    fieldWidth,
    fieldHeight,
    samples,
    sampleWidth,
    sampleRows,
    coverage,
    distances,
    inkAlpha: inkPixels.data,
    scale: ((scaleX + scaleY) / 2) * samples,
    rail: rail && { y: (rail.top - bounds.top) * scaleY, height: rail.height * scaleY },
  };
}

type Geometry = NonNullable<ReturnType<typeof measureArtwork>>;

function paintMask(context: CanvasRenderingContext2D, geometry: Geometry, profile: OutlineProfile) {
  const { width, height } = context.canvas;
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);

  if (profile.widthPx > 0) {
    const {
      x,
      y,
      fieldWidth,
      fieldHeight,
      samples,
      sampleWidth,
      sampleRows,
      distances,
      scale,
      inkAlpha,
    } = geometry;
    const radius = profile.widthPx * scale;
    const opacity = outlineOpacityCurve(profile.curve);
    const curve = Float32Array.from({ length: curveResolution + 1 }, (_, i) =>
      opacity(i / curveResolution),
    );
    const field = context.createImageData(fieldWidth, fieldHeight);
    const count = samples ** 2;
    const unit = curveResolution / radius;
    for (let row = 0; row < fieldHeight; row++) {
      for (let column = 0; column < fieldWidth; column++) {
        const first = (row * sampleWidth + column) * samples;
        const pixel = (row * fieldWidth + column) * 4 + 3;
        if (inkAlpha[pixel] === 255) {
          field.data[pixel] = 255;
          continue;
        }
        let ink = 0;
        let silhouette = 0;
        for (const offset of sampleRows) {
          for (let i = 0; i < samples; i++) {
            const sample = first + offset + i;
            const distance = distances[sample];
            const original = geometry.coverage[sample] / 255;
            const edgeCoverage = Math.min(1, Math.max(0, radius + 0.5 - distance));
            const fade = curve[Math.min(curveResolution, Math.max(0, Math.round(distance * unit)))];
            ink += original;
            silhouette += Math.max(original, edgeCoverage * fade);
          }
        }
        field.data[pixel] = 255 * (1 - outlineCutout(ink, silhouette, count));
      }
    }
    context.putImageData(field, x, y);
  }
  if (geometry.rail) {
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "rgb(0 0 0 / 91%)";
    context.fillRect(0, geometry.rail.y, width, geometry.rail.height);
  }
}

export function attachProductCardOutline(artwork: HTMLDivElement, canvas: HTMLCanvasElement) {
  const card = artwork.parentElement;
  const copy = card?.querySelectorAll<HTMLElement>("[data-card-outline-copy]");
  const downloads = card?.querySelector<HTMLElement>("nav");
  const source = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const mask = document.createElement("canvas").getContext("2d");
  const ink = canvas.getContext("2d");
  if (!copy?.length || !source || !mask || !ink) return;

  const root = document.documentElement;
  let geometry: Geometry | undefined;
  let scheduled = 0;
  let disposed = false;
  let nearby = false;

  const schedule = () => {
    if (disposed || scheduled || !nearby) return;
    scheduled = window.requestAnimationFrame(() => {
      scheduled = 0;
      if (!nearby) return;
      geometry ??= measureArtwork(artwork, copy, downloads, source, ink, mask);
      if (!geometry) return;
      paintMask(mask, geometry, readOutlineProfile(root.getAttribute(profileAttribute)));
      artwork.style.maskImage = `url("${mask.canvas.toDataURL()}")`;
      artwork.dataset.outlineReady = "";
    });
  };

  function resizeOutline() {
    geometry = undefined;
    schedule();
  }

  const intersection = new IntersectionObserver(
    ([entry]) => {
      nearby = entry.isIntersecting;
      if (!nearby) geometry = undefined;
      schedule();
    },
    { rootMargin: "250px" },
  );
  intersection.observe(artwork);
  const resize = new ResizeObserver(resizeOutline);
  for (const element of [artwork, ...copy]) resize.observe(element);
  if (downloads) resize.observe(downloads);
  const settings = new MutationObserver(schedule);
  settings.observe(root, { attributes: true, attributeFilter: [profileAttribute] });
  window.addEventListener("resize", resizeOutline);
  void document.fonts.ready.then(resizeOutline);
  return () => {
    disposed = true;
    if (scheduled) window.cancelAnimationFrame(scheduled);
    intersection.disconnect();
    resize.disconnect();
    settings.disconnect();
    window.removeEventListener("resize", resizeOutline);
  };
}
