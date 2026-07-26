import { act, createElement } from "react";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  INITIAL_PLATE_OFFSETS,
  arePlatesAligned,
  clampPlateOffset,
  getAmbientOffsets,
  getPlateZIndices,
} from "../../app/components/Chromatic404Artwork.logic";
import { NotFoundPage } from "../../app/components/NotFoundPage";
import { getRootErrorKind } from "../../app/rootError";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });
  Object.defineProperty(dom.window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("Element", dom.window.Element);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("Node", dom.window.Node);
});

afterEach(() => {
  vi.unstubAllGlobals();
  dom.window.close();
});

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

  test("keeps the plate furthest from registration on top", () => {
    expect(getPlateZIndices(INITIAL_PLATE_OFFSETS)).toEqual({
      red: 4,
      amber: 3,
      blue: 2,
    });
    expect(
      getPlateZIndices({
        red: { x: 0, y: 0 },
        amber: { x: 20, y: 11 },
        blue: { x: 0, y: 0 },
      }).amber,
    ).toBe(4);
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
    expect(html).toContain('aria-label="Align colour plates automatically"');
  });

  test("keeps long display words intact inside the copy poster", () => {
    const css = readFileSync("app/components/NotFoundPage.module.css", "utf8");

    expect(css).not.toContain("max-width: 10ch");
    expect(css).toContain("grid-template-columns: minmax(22rem, 0.82fr) minmax(30rem, 1.18fr);");
    expect(css).toMatch(
      /\.message h1\s*{[^}]*font-size: clamp\(2\.25rem, 3\.4vw, 4rem\);[^}]*letter-spacing: 0;[^}]*overflow-wrap: normal;[^}]*word-break: normal;/s,
    );
  });

  test("allows both posters to shrink without mobile overflow", () => {
    const pageCss = readFileSync("app/components/NotFoundPage.module.css", "utf8");
    const artworkCss = readFileSync("app/components/Chromatic404Artwork.module.css", "utf8");

    expect(pageCss).toMatch(/\.copy\s*{[^}]*min-width: 0;/s);
    expect(artworkCss).toMatch(/\.artwork\s*{[^}]*min-width: 0;/s);
    expect(pageCss).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.message h1\s*{[^}]*font-size: clamp\(1\.75rem, 8\.8vw, 2\.75rem\);/s,
    );
    expect(artworkCss.match(/^\.artwork\s*{([^}]*)}/m)?.[1]).not.toContain("touch-action: none");
    expect(artworkCss).toMatch(/\.plate\s*{[^}]*touch-action: none;/s);
  });

  test("offers an accessible shortcut while retaining both exits after success", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root;

    await act(async () => {
      root = createRoot(container);
      root.render(createElement(MemoryRouter, null, createElement(NotFoundPage)));
    });

    const linkLabels = () =>
      Array.from(container.querySelectorAll("a"), (link) => link.textContent);

    expect(linkLabels()).toEqual(expect.arrayContaining(["Return home", "View products"]));

    const alignButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Align colour plates automatically"]',
    );
    expect(alignButton).not.toBeNull();

    await act(async () => {
      alignButton!.click();
    });

    expect(container.querySelector("h1")?.textContent).toBe("Beautifully wrong.");
    expect(linkLabels()).toEqual(expect.arrayContaining(["Return home", "View products"]));

    const playAgain = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Play again",
    );
    expect(playAgain).toBeDefined();

    await act(async () => {
      playAgain!.click();
    });

    expect(container.querySelector("h1")?.textContent).toBe("This page slipped out of register.");

    await act(async () => {
      root!.unmount();
    });
    container.remove();
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
