import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { act, createElement, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, MemoryRouter, RouterProvider } from "react-router";
import { JSDOM } from "jsdom";
import { describe, expect, test, vi } from "vitest";
import { SiteLink } from "../../app/components/SiteLink";
import {
  installAnalyticsMarkup,
  assertAnalyticsInstallation,
  assertNoIndependentAnalytics,
  writeAnalyticsRuntime,
} from "../../scripts/analytics-publication";
import { analyticsConfig } from "../../app/analytics/config";
import { installAnalytics, type AnalyticsWindow } from "../../app/analytics/runtime";

describe("website boundaries", () => {
  test.each([
    ["/", "/products/", false],
    ["/", "/products/palette-master/", true],
    ["/products/palette-master/", "/products/palette-master/privacy/", false],
    ["/products/palette-master/", "/", true],
    ["/", "/products/ratebench/", true],
  ])("uses document navigation from %s to %s: %s", async (from, to, reload) => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
      url: `https://www.keyflare.studio${from}`,
    });
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const root = createRoot(dom.window.document.querySelector("#app")!);
    try {
      await act(async () =>
        root.render(
          createElement(
            MemoryRouter,
            { initialEntries: [from] },
            createElement(SiteLink, { to }, "Open"),
          ),
        ),
      );
      let handledByRouter: boolean | undefined;
      dom.window.document.addEventListener("click", (event) => {
        handledByRouter = event.defaultPrevented;
        event.preventDefault(); // Keep jsdom from attempting document navigation.
      });
      await act(async () => {
        dom.window.document.querySelector("a")!.click();
      });
      expect(handledByRouter).toBe(!reload);
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
      dom.window.close();
    }
  });
});

describe("asynchronous router interactions", () => {
  test("counts the accepted SPA click once before its route loader finishes", async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
      url: "https://www.keyflare.studio/",
    });
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const win = dom.window as unknown as AnalyticsWindow;
    const calls: unknown[][] = [];
    win.ym = (...args) => {
      calls.push(args);
    };
    installAnalytics(win, analyticsConfig);
    let finish!: () => void;
    const loader = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const router = createBrowserRouter(
      [
        {
          path: "/",
          element: createElement(
            Fragment,
            null,
            createElement(
              SiteLink,
              { to: "/products/", className: "cancel", onClick: (event) => event.preventDefault() },
              "Cancelled",
            ),
            createElement(SiteLink, { to: "/products/", className: "accepted" }, "Products"),
          ),
        },
        { path: "/products/", loader: () => loader, element: createElement("p", null, "Catalog") },
      ],
      { window: win },
    );
    const root = createRoot(dom.window.document.querySelector("#app")!);
    try {
      await act(async () => root.render(createElement(RouterProvider, { router })));
      await act(async () => {
        dom.window.document.querySelector<HTMLAnchorElement>(".cancel")!.click();
      });
      expect(calls.filter((call) => call[1] === "reachGoal")).toHaveLength(0);
      await act(async () => {
        dom.window.document.querySelector<HTMLAnchorElement>(".accepted")!.click();
      });
      expect(calls.filter((call) => call[1] === "hit")).toHaveLength(1);
      expect(calls.filter((call) => call[1] === "reachGoal")).toEqual([
        [
          114594196,
          "reachGoal",
          "navigation_click",
          expect.objectContaining({ source_page: "https://www.keyflare.studio/" }),
        ],
      ]);
      await act(async () => {
        finish();
        await loader;
      });
      expect(calls.filter((call) => call[1] === "hit")).toHaveLength(2);
    } finally {
      finish();
      router.dispose();
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
      dom.window.close();
    }
  });
});

describe("analytics publication contract", () => {
  const html =
    '<!doctype html><html lang="en"><head><title>Product</title></head><body><a href="./privacy/">Privacy</a><script src="./assets/app.js" defer></script></body></html>';
  test("installs exactly one shared runtime while preserving complete export content", () => {
    const result = installAnalyticsMarkup(html, "ratebench");
    const doc = new JSDOM(result).window.document;
    expect(doc.title).toBe("Product");
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("./privacy/");
    expect(doc.querySelectorAll('script[data-site-analytics="shared"]')).toHaveLength(1);
    expect(doc.querySelector("script[data-site-analytics]")?.getAttribute("src")).toBe(
      "/site-analytics.js",
    );
    expect(() => assertAnalyticsInstallation(result, "ratebench")).not.toThrow();
  });
  test.each([
    '<script>ym(114223600, "init", {});</script>',
    '<script src="https://mc.yandex.ru/metrika/tag.js"></script>',
    '<script data-site-analytics="shared" src="/site-analytics.js"></script>',
  ])("rejects pre-existing installations instead of silently stripping them", (legacy) => {
    expect(() =>
      installAnalyticsMarkup(html.replace("</body>", `${legacy}</body>`), "ratebench"),
    ).toThrow(/analytics/i);
  });
  test.each([
    'window.ym(114223600, "init", {});',
    'const load = () => "https://mc.yandex.ru/metrika/tag.js";',
    'ym(114223600, "reachGoal", "google_play_click");',
    "new Ya.Metrika({ id: 123 });",
  ])("rejects independent Metrica code in any export asset", (source) => {
    expect(() => assertNoIndependentAnalytics(source, "assets/anything.js")).toThrow(/analytics/i);
  });
  test("allows unrelated application JavaScript", () => {
    expect(() =>
      assertNoIndependentAnalytics(
        'document.querySelector("button").addEventListener("click", () => {});',
        "app.js",
      ),
    ).not.toThrow();
  });
  test("rejects missing and duplicate runtime output", () => {
    expect(() => assertAnalyticsInstallation(html, "ratebench")).toThrow(/analytics/i);
    const installed = installAnalyticsMarkup(html, "ratebench");
    expect(() =>
      assertAnalyticsInstallation(
        installed.replace(
          "</body>",
          '<script data-site-analytics="shared" src="/site-analytics.js"></script></body>',
        ),
        "ratebench",
      ),
    ).toThrow(/analytics/i);
  });
  test("generates a runnable standalone runtime from the same tested TypeScript module", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-analytics-"));
    try {
      await writeAnalyticsRuntime(dir);
      const source = await readFile(join(dir, "site-analytics.js"), "utf8");
      const dom = new JSDOM(html, {
        url: "https://www.keyflare.studio/products/ratebench/",
        runScripts: "outside-only",
      });
      dom.window.eval(source);
      const win = dom.window as unknown as AnalyticsWindow;
      expect(win.ym?.a?.filter((call) => call[1] === "hit")).toHaveLength(1);
      installAnalytics(win, { origin: win.location.origin, sites: [] });
      expect(win.ym?.a?.filter((call) => call[1] === "hit")).toHaveLength(1);
      dom.window.close();
      await writeFile(join(dir, "unrelated"), "unchanged");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
