import { act, createElement } from "react";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  TEAR_COMPLETION_THRESHOLD,
  TEAR_START_PROGRESS,
  clampTearProgress,
  getTearProgress,
  shouldCompleteTear,
} from "../../app/components/TearOff404Artwork.logic";
import { NotFoundPage } from "../../app/components/NotFoundPage";
import { getRootErrorKind } from "../../app/rootError";

let dom: JSDOM;

function dispatchPointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel" | "lostpointercapture",
  clientX: number,
  pointerId = 1,
) {
  const event = new dom.window.MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
  });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  target.dispatchEvent(event);
}

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

describe("tear-off 404 geometry", () => {
  test("starts with a visible sliver and clamps progress", () => {
    expect(TEAR_START_PROGRESS).toBe(0.08);
    expect(clampTearProgress(-1)).toBe(0);
    expect(clampTearProgress(0.42)).toBe(0.42);
    expect(clampTearProgress(2)).toBe(1);
  });

  test("maps horizontal pointer movement one-to-one across the artwork", () => {
    expect(
      getTearProgress({
        startProgress: TEAR_START_PROGRESS,
        startClientX: 100,
        currentClientX: 300,
        artworkWidth: 800,
      }),
    ).toBeCloseTo(0.33);
  });

  test("completes only at the declared release threshold", () => {
    expect(TEAR_COMPLETION_THRESHOLD).toBe(0.58);
    expect(shouldCompleteTear(0.57)).toBe(false);
    expect(shouldCompleteTear(0.58)).toBe(true);
  });
});

describe("tear-off 404 page", () => {
  test("renders useful 404 content and exits before hydration", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(NotFoundPage)),
    );

    expect(html).toContain("ERROR EDITION / 404");
    expect(html).toContain("This page isn’t here.");
    expect(html).toContain("Pull the error print aside");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/products/"');
    expect(html).toContain("noindex, follow");
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Tear away the error poster"');
  });

  test("uses one wide poster instead of the old two-card layout", () => {
    const css = readFileSync("app/components/NotFoundPage.module.css", "utf8");

    expect(css).not.toContain(
      "grid-template-columns: minmax(22rem, 0.82fr) minmax(30rem, 1.18fr);",
    );
    expect(css).toMatch(/\.page\s*{[^}]*display: grid;[^}]*min-width: 0;/s);
    expect(css).toMatch(/\.intro h1\s*{[^}]*font-size: 4\.5rem;[^}]*letter-spacing: 0;/s);
  });

  test("keeps the artwork and actions usable without mobile overflow", () => {
    const pageCss = readFileSync("app/components/NotFoundPage.module.css", "utf8");
    const artworkCss = readFileSync("app/components/TearOff404Artwork.module.css", "utf8");

    expect(pageCss).toMatch(/\.page\s*{[^}]*min-width: 0;/s);
    expect(artworkCss).toMatch(/\.artwork\s*{[^}]*min-width: 0;/s);
    expect(artworkCss.match(/^\.artwork\s*{([^}]*)}/m)?.[1]).not.toContain("touch-action: none");
    expect(artworkCss).toMatch(/\.pullHandle\s*{[^}]*touch-action: none;/s);
    expect(artworkCss).toMatch(
      /@media \(max-width: 580px\)[\s\S]*?\.sheetTitle\s*{[^}]*font-size: 2\.8rem;/s,
    );
    expect(artworkCss).toMatch(
      /\.pullHandle:hover,[\s\S]*?transform: translate\(-50%, -50%\) rotate\(3deg\);/s,
    );
    expect(pageCss).toMatch(/@media \(max-width: 580px\)[\s\S]*?\.actions\s*{[^}]*width: 100%;/s);
  });

  test("offers one accessible tear action and retains both exits after opening", async () => {
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

    const pullHandle = container.querySelector<HTMLButtonElement>(
      '[aria-label="Tear away the error poster"]',
    );
    expect(pullHandle).not.toBeNull();

    await act(async () => {
      pullHandle!.click();
    });

    expect(container.querySelector("h1")?.textContent).toBe("Nothing underneath either.");
    expect(linkLabels()).toEqual(expect.arrayContaining(["Return home", "View products"]));
    expect(container.querySelector('[aria-label="Tear away the error poster"]')).toBeNull();

    const printAgain = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Print it again",
    );
    expect(printAgain).toBeDefined();

    await act(async () => {
      printAgain!.click();
    });

    expect(container.querySelector("h1")?.textContent).toBe("This page isn’t here.");

    await act(async () => {
      root!.unmount();
    });
    container.remove();
  });

  test("completes a long drag and resets a short drag", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root;

    await act(async () => {
      root = createRoot(container);
      root.render(createElement(MemoryRouter, null, createElement(NotFoundPage)));
    });

    const artwork = container.querySelector<HTMLElement>("[data-tear-artwork]")!;
    const getHandle = () =>
      container.querySelector<HTMLButtonElement>('[aria-label="Tear away the error poster"]')!;
    Object.defineProperty(artwork, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ width: 1000 }),
    });

    const prepareCapture = (handle: HTMLButtonElement, pointerId = 1) => {
      let captured = false;
      handle.setPointerCapture = vi.fn(() => {
        captured = true;
      });
      handle.hasPointerCapture = vi.fn(() => captured);
      handle.releasePointerCapture = vi.fn(() => {
        captured = false;
        dispatchPointer(artwork, "lostpointercapture", 0, pointerId);
      });
    };

    const shortHandle = getHandle();
    prepareCapture(shortHandle);
    await act(async () => {
      dispatchPointer(shortHandle, "pointerdown", 80);
      dispatchPointer(artwork, "pointermove", 400);
      dispatchPointer(artwork, "pointerup", 400);
    });

    expect(container.querySelector("h1")?.textContent).toBe("This page isn’t here.");
    expect(artwork.style.getPropertyValue("--tear-position")).toBe("8%");

    const longHandle = getHandle();
    prepareCapture(longHandle, 2);
    await act(async () => {
      dispatchPointer(longHandle, "pointerdown", 80, 2);
      dispatchPointer(artwork, "pointermove", 700, 2);
      dispatchPointer(artwork, "pointerup", 700, 2);
    });

    expect(container.querySelector("h1")?.textContent).toBe("Nothing underneath either.");

    await act(async () => {
      root!.unmount();
    });
    container.remove();
  });

  test("does not swallow activation after a cancelled drag", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root;

    await act(async () => {
      root = createRoot(container);
      root.render(createElement(MemoryRouter, null, createElement(NotFoundPage)));
    });

    const artwork = container.querySelector<HTMLElement>("[data-tear-artwork]")!;
    const handle = container.querySelector<HTMLButtonElement>(
      '[aria-label="Tear away the error poster"]',
    )!;
    Object.defineProperty(artwork, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ width: 1000 }),
    });
    let captured = false;
    handle.setPointerCapture = vi.fn(() => {
      captured = true;
    });
    handle.hasPointerCapture = vi.fn(() => captured);
    handle.releasePointerCapture = vi.fn(() => {
      captured = false;
    });

    await act(async () => {
      dispatchPointer(handle, "pointerdown", 80);
      dispatchPointer(artwork, "pointermove", 120);
      dispatchPointer(artwork, "pointercancel", 120);
      handle.click();
    });

    expect(container.querySelector("h1")?.textContent).toBe("Nothing underneath either.");

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
      expect(html).toContain("This page isn’t here.");
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
    expect(html).not.toContain("This page isn’t here.");
  });
});
