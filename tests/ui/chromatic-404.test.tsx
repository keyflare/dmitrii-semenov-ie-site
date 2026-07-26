import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import {
  INITIAL_PLATE_OFFSETS,
  arePlatesAligned,
  clampPlateOffset,
  getAmbientOffsets,
} from "../../app/components/Chromatic404Artwork.logic";
import { NotFoundPage } from "../../app/components/NotFoundPage";
import { getRootErrorKind } from "../../app/rootError";

describe("chromatic 404 artwork geometry", () => {
  test("starts visibly out of register", () => {
    expect(INITIAL_PLATE_OFFSETS.red).toEqual({ x: -24, y: -9 });
    expect(INITIAL_PLATE_OFFSETS.amber).toEqual({ x: 20, y: 11 });
    expect(INITIAL_PLATE_OFFSETS.blue).toEqual({ x: 0, y: 0 });
    expect(arePlatesAligned(INITIAL_PLATE_OFFSETS)).toBe(false);
  });

  test("clamps dragged plates inside the artwork", () => {
    expect(clampPlateOffset({ x: 99, y: -80 })).toEqual({ x: 48, y: -48 });
  });

  test("maps pointer position to small opposing ambient offsets", () => {
    expect(getAmbientOffsets(1, -1)).toEqual({
      red: { x: -8, y: 8 },
      amber: { x: 6, y: -6 },
      blue: { x: -2, y: 2 },
    });
  });

  test("snaps only when every plate is close to registration", () => {
    expect(
      arePlatesAligned({
        red: { x: 5, y: 4 },
        amber: { x: -3, y: 6 },
        blue: { x: 0, y: 0 },
      }),
    ).toBe(true);
    expect(
      arePlatesAligned({
        red: { x: 10, y: 0 },
        amber: { x: 0, y: 0 },
        blue: { x: 0, y: 0 },
      }),
    ).toBe(false);
  });
});

describe("chromatic 404 page", () => {
  test("renders useful 404 content and exits before hydration", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(NotFoundPage)),
    );

    expect(html).toContain("ERROR EDITION / 404");
    expect(html).toContain("This page slipped out of register.");
    expect(html).toContain("The address is real. The page isn&#x27;t.");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/products/"');
    expect(html).toContain("noindex, follow");
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain('aria-live="polite"');
  });
});

describe("root error classification", () => {
  test("separates 404 route responses from unexpected errors", () => {
    expect(
      getRootErrorKind({
        status: 404,
        statusText: "Not Found",
        internal: true,
        data: "No route matches URL",
      }),
    ).toBe("not-found");
    expect(
      getRootErrorKind({
        status: 500,
        statusText: "Server Error",
        internal: false,
        data: "Broken",
      }),
    ).toBe("error");
    expect(getRootErrorKind(new Error("Broken"))).toBe("error");
  });

  test("renders the missing page through the hydration fallback and root boundary", async () => {
    const { RootErrorBoundary, RootHydrateFallback } = await import("../../app/root");
    const route404 = {
      status: 404,
      statusText: "Not Found",
      internal: true,
      data: "No route matches URL",
    };

    const fallbackHtml = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(RootHydrateFallback)),
    );
    const errorHtml = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(RootErrorBoundary, {
          error: route404,
        }),
      ),
    );

    for (const html of [fallbackHtml, errorHtml]) {
      expect(html).toContain("Keyflare Studio");
      expect(html).toContain("This page slipped out of register.");
      expect(html).toContain("Return home");
    }
  });

  test("keeps unexpected root errors distinct from missing pages", async () => {
    const { RootErrorBoundary } = await import("../../app/root");
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(RootErrorBoundary, {
          error: new Error("Broken"),
        }),
      ),
    );

    expect(html).toContain("Something went wrong");
    expect(html).not.toContain("This page slipped out of register.");
  });
});
