import { JSDOM } from "jsdom";
import { afterEach, describe, expect, test } from "vitest";
import { analyticsConfig, buildAnalyticsConfig } from "../../app/analytics/config";
import { installAnalytics, type AnalyticsWindow } from "../../app/analytics/runtime";
import { getPublicPaths, products } from "../../app/content/products/registry";

const origin = "https://www.keyflare.studio";
const doms: JSDOM[] = [];
function browser(path = "/", base = origin, html = "") {
  const dom = new JSDOM(
    `<!doctype html><html><head><title>Page</title></head><body>${html}</body></html>`,
    {
      url: `${base}${path}`,
    },
  );
  doms.push(dom);
  const calls: unknown[][] = [];
  const win = dom.window as unknown as AnalyticsWindow;
  win.ym = (...args: unknown[]) => {
    calls.push(args);
  };
  return { dom, win, calls, doc: dom.window.document };
}
function commands(calls: unknown[][], command: string) {
  return calls.filter((call) => call[1] === command);
}
async function click(dom: JSDOM, selector: string, options: MouseEventInit = {}, type = "click") {
  dom.window.document.querySelector(selector)!.dispatchEvent(
    new dom.window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...options,
    }),
  );
  await Promise.resolve();
}
afterEach(() => doms.splice(0).forEach((dom) => dom.window.close()));

describe("website analytics ownership", () => {
  test("assigns every published page to exactly one website and keeps Ratebench's counter", () => {
    const pages = analyticsConfig.sites.flatMap((site) => site.paths);
    expect(new Set(pages).size).toBe(pages.length);
    expect(new Set(pages)).toEqual(new Set(getPublicPaths()));
    expect(analyticsConfig.sites.find((site) => site.key === "ratebench")?.counterId).toBe(
      114223600,
    );
    for (const site of analyticsConfig.sites) {
      expect(site.counterId).toBeGreaterThan(0);
      if (site.key !== "studio")
        expect(site.paths.every((path) => path.startsWith(`/products/${site.key}`))).toBe(true);
    }
    expect(analyticsConfig.sites.find((site) => site.key === "studio")?.paths).toEqual([
      "/",
      "/products",
      "/contact",
      "/privacy",
      "/legal",
    ]);
  });
  test.each(getPublicPaths())("sends exactly one owning pageview for public page %s", (path) => {
    const { win, calls } = browser(path === "/" ? path : `${path}/`);
    installAnalytics(win, analyticsConfig);
    const owner = analyticsConfig.sites.find((site) => site.paths.includes(path));
    expect(commands(calls, "init")).toHaveLength(1);
    expect(commands(calls, "hit")).toEqual([
      [owner?.counterId, "hit", `${origin}${path === "/" ? path : `${path}/`}`, expect.any(Object)],
    ]);
  });
  test("derives product paths only from published products", () => {
    const config = buildAnalyticsConfig(
      products.map((product) => ({ ...product, status: "draft" })),
    );
    expect(config.sites.flatMap((site) => site.paths)).not.toContain("/products/palette-master");
  });
  test.each(["http://localhost:5173", "https://keyflare.studio", "https://preview.example"])(
    "sends nothing on %s",
    (base) => {
      const { win, calls, doc } = browser("/", base);
      installAnalytics(win, analyticsConfig);
      expect(calls).toEqual([]);
      expect(doc.querySelector('script[src*="mc.yandex"]')).toBeNull();
    },
  );
  test.each([
    "/unknown/",
    "/products/fixture-product/",
    "/products/palette-master/unknown/",
    "/404.html",
    "/products//",
    "/products/palette-master//",
  ])("sends nothing for %s", (path) => {
    const { win, calls } = browser(path);
    installAnalytics(win, analyticsConfig);
    expect(calls).toEqual([]);
  });
});

describe("shared browser runtime", () => {
  test("initializes one owning counter once and sends one sanitized initial hit", () => {
    const { win, calls, doc } = browser(
      "/products/ratebench/?utm_source=launch&utm_campaign=release&email=private#secret",
    );
    installAnalytics(win, analyticsConfig);
    installAnalytics(win, analyticsConfig);
    expect(commands(calls, "init")).toEqual([
      [
        114223600,
        "init",
        expect.objectContaining({
          defer: true,
          disableYtm: true,
          webvisor: false,
          clickmap: false,
          trackLinks: false,
          url: `${origin}/products/ratebench/?utm_source=launch&utm_campaign=release`,
        }),
      ],
    ]);
    expect(commands(calls, "hit")).toEqual([
      [
        114223600,
        "hit",
        `${origin}/products/ratebench/?utm_source=launch&utm_campaign=release`,
        expect.any(Object),
      ],
    ]);
    expect(doc.querySelectorAll('script[src="https://mc.yandex.ru/metrika/tag.js"]')).toHaveLength(
      1,
    );
  });
  test("counts initial, SPA, real back/forward and repeated visits without hash or replace duplicates", async () => {
    const { win, calls, dom } = browser();
    installAnalytics(win, analyticsConfig);
    win.history.replaceState({ key: "initial" }, "", "/");
    win.history.pushState({ key: "catalog" }, "", "/products/");
    win.history.pushState({ key: "catalog-repeat" }, "", "/products/");
    win.history.replaceState({ key: "catalog-repeat" }, "", "/products/#details");
    win.history.replaceState({ key: "catalog-repeat" }, "", "/products/?private=ignored");
    win.history.replaceState({ key: "catalog-repeat" }, "", "/products/");
    async function traverse(direction: "back" | "forward") {
      const moved = new Promise<void>((resolve) =>
        win.addEventListener("popstate", () => resolve(), { once: true }),
      );
      win.history[direction]();
      await moved;
    }
    await traverse("back");
    await traverse("back");
    await traverse("forward");
    expect(commands(calls, "hit").map((call) => call[2])).toEqual([
      `${origin}/`,
      `${origin}/products/`,
      `${origin}/products/`,
      `${origin}/products/`,
      `${origin}/`,
      `${origin}/products/`,
    ]);
    win.dispatchEvent(new dom.window.PageTransitionEvent("pageshow", { persisted: true }));
    expect(commands(calls, "hit")).toHaveLength(7);
  });
  test("does not count native hash changes or history traversal between fragment entries", async () => {
    const { win, calls } = browser("/products/");
    installAnalytics(win, analyticsConfig);
    const changed = new Promise<void>((resolve) =>
      win.addEventListener("hashchange", () => resolve(), { once: true }),
    );
    win.location.hash = "details";
    await changed;
    const back = new Promise<void>((resolve) =>
      win.addEventListener("popstate", () => resolve(), { once: true }),
    );
    win.history.back();
    await back;
    expect(commands(calls, "hit")).toHaveLength(1);
  });
  test.each(["/products/#details", "/products/?private=ignored"])(
    "ignores router back/forward between metadata-only entries at %s",
    async (href) => {
      const { win, calls } = browser("/products/");
      win.history.replaceState({ key: "base" }, "", "/products/");
      installAnalytics(win, analyticsConfig);
      win.history.pushState({ key: "metadata" }, "", href);
      async function traverse(direction: "back" | "forward") {
        const moved = new Promise<void>((resolve) =>
          win.addEventListener("popstate", () => resolve(), { once: true }),
        );
        win.history[direction]();
        await moved;
      }
      await traverse("back");
      await traverse("forward");
      expect(commands(calls, "hit")).toHaveLength(1);
    },
  );
  test("counts a BFCache restoration once when the browser also dispatches popstate", async () => {
    const { win, calls, dom } = browser("/products/");
    installAnalytics(win, analyticsConfig);
    win.dispatchEvent(new dom.window.PageTransitionEvent("pageshow", { persisted: true }));
    win.dispatchEvent(new dom.window.PopStateEvent("popstate"));
    expect(commands(calls, "hit")).toHaveLength(2);
    await new Promise((resolve) => win.setTimeout(resolve, 0));
    win.history.pushState({ key: "repeat" }, "", "/products/");
    const moved = new Promise<void>((resolve) =>
      win.addEventListener("popstate", () => resolve(), { once: true }),
    );
    win.history.back();
    await moved;
    expect(commands(calls, "hit")).toHaveLength(4);
  });
  test("never sends product pageviews to Studio even after a programmatic boundary crossing", () => {
    const { win, calls } = browser();
    installAnalytics(win, analyticsConfig);
    win.history.pushState(null, "", "/products/palette-master/");
    win.history.pushState(null, "", "/products/ratebench/privacy/");
    win.history.pushState(null, "", "/products/fixture-product/");
    const hits = commands(calls, "hit");
    expect(hits).toHaveLength(3);
    expect(hits[0][0]).toBe(114594196);
    expect(hits[1][0]).toBe(
      analyticsConfig.sites.find((site) => site.key === "palette-master")?.counterId,
    );
    expect(hits[2][0]).toBe(114223600);
  });
  test("keeps a queue before Yandex loads and never exposes arbitrary page query data", () => {
    const { win } = browser("/?utm_medium=email&token=private#secret");
    delete win.ym;
    installAnalytics(win, analyticsConfig);
    const metrica = (win as AnalyticsWindow).ym;
    expect(metrica?.a?.map((call) => Array.from(call))).toEqual(
      expect.arrayContaining([
        [114594196, "hit", `${origin}/?utm_medium=email`, expect.any(Object)],
      ]),
    );
    expect(JSON.stringify(metrica?.a)).not.toContain("private");
  });
});

describe("delegated interaction goals", () => {
  test.each([
    [
      "https://play.google.com/store/apps/details?id=com.example&token=secret#fragment",
      "google_play_click",
      "https://play.google.com/store/apps/details?id=com.example",
    ],
    [
      "https://apps.apple.com/app/id123?token=secret",
      "app_store_click",
      "https://apps.apple.com/app/id123",
    ],
    [
      "mailto:support@keyflare.studio?subject=hello&body=private",
      "support_click",
      "mailto:support@keyflare.studio",
    ],
    ["/products/", "navigation_click", `${origin}/products/`],
    ["https://example.com/path?private=yes#hidden", "outbound_click", "https://example.com/path"],
  ])(
    "sends exactly one %s goal including nested and modified clicks",
    async (href, goal, destination) => {
      const { win, calls, dom } = browser(
        "/products/ratebench/",
        origin,
        `<nav data-analytics-location="hero"><a href="${href}" data-analytics-id="primary"><span>Open</span></a></nav>`,
      );
      installAnalytics(win, analyticsConfig);
      await click(dom, "span", { ctrlKey: true });
      await click(dom, "span", { metaKey: true });
      const goals = commands(calls, "reachGoal");
      expect(goals).toHaveLength(2);
      expect(goals[0]).toEqual([
        114223600,
        "reachGoal",
        goal,
        expect.objectContaining({
          source_page: `${origin}/products/ratebench/`,
          destination,
          element_id: "primary",
          label: "Open",
          location: "hero",
          product: "ratebench",
        }),
      ]);
      expect(JSON.stringify(goals)).not.toContain("private");
      expect(JSON.stringify(goals)).not.toContain("secret");
    },
  );
  test("counts middle clicks once, ignores right clicks and auxclick on buttons", async () => {
    const { win, calls, dom } = browser(
      "/",
      origin,
      '<a href="https://example.com"><span>Open</span></a><button>Action</button>',
    );
    installAnalytics(win, analyticsConfig);
    await click(dom, "span", { button: 1 }, "auxclick");
    await click(dom, "span", { button: 2 }, "auxclick");
    await click(dom, "button", { button: 1 }, "auxclick");
    expect(commands(calls, "reachGoal")).toHaveLength(1);
  });
  test("counts keyboard-generated and repeated real button activations using semantic IDs", async () => {
    const { win, calls, dom } = browser(
      "/products/palette-master/",
      origin,
      '<button data-analytics-id="screenshot-next" aria-label="Next screenshot"><span>Next</span></button><div role="button" tabindex="0" data-analytics-id="other">Open</div>',
    );
    installAnalytics(win, analyticsConfig);
    installAnalytics(win, analyticsConfig);
    await click(dom, "span", { detail: 0 });
    await click(dom, "span", { detail: 0 });
    await click(dom, '[role="button"]', { detail: 0 });
    expect(
      commands(calls, "reachGoal").map((call) => [
        call[2],
        (call[3] as Record<string, string>).element_id,
      ]),
    ).toEqual([
      ["button_click", "screenshot-next"],
      ["button_click", "screenshot-next"],
      ["button_click", "other"],
    ]);
  });
  test("ignores disabled, cancelled, unsafe protocol and form contents", async () => {
    const { win, calls, dom, doc } = browser(
      "/",
      origin,
      '<button disabled>Disabled</button><div role="button" aria-disabled="true">Disabled</div><a href="/contact/">Cancelled</a><a href="javascript:alert(1)">Unsafe</a><form><button><textarea>private message</textarea>Send</button></form>',
    );
    doc.querySelector("a")!.addEventListener("click", (event) => event.preventDefault());
    installAnalytics(win, analyticsConfig);
    await click(dom, "button[disabled]");
    await click(dom, '[aria-disabled="true"]');
    await click(dom, "a");
    await click(dom, 'a[href^="javascript"]');
    await click(dom, "form button");
    expect(commands(calls, "reachGoal")).toHaveLength(1);
    expect(JSON.stringify(commands(calls, "reachGoal"))).not.toContain("private message");
  });
  test("observes cancellation when capture microtasks flush before target handlers", async () => {
    const { win, calls, dom, doc } = browser(
      "/",
      origin,
      '<a href="/products/"><span>Cancelled</span></a><button>Accepted</button>',
    );
    // Trusted browser callbacks can reach a microtask checkpoint between listeners.
    // jsdom's synchronous dispatch does not do this, so model that scheduler here.
    win.queueMicrotask = (callback) => callback();
    installAnalytics(win, analyticsConfig);
    doc.querySelector("a")!.addEventListener("click", (event) => event.preventDefault());
    await click(dom, "span");
    expect(commands(calls, "reachGoal")).toHaveLength(0);
    await click(dom, "button");
    expect(commands(calls, "reachGoal")).toHaveLength(1);
  });
  test("counts accepted same-page SPA anchor interactions without an extra pageview", async () => {
    const { win, calls, dom, doc } = browser(
      "/products/",
      origin,
      '<a href="#details">Details</a>',
    );
    installAnalytics(win, analyticsConfig);
    doc.querySelector("a")!.addEventListener("click", (event) => {
      event.preventDefault();
      win.history.pushState({}, "", "/products/#details");
    });
    await click(dom, "a");
    expect(commands(calls, "hit")).toHaveLength(1);
    expect(commands(calls, "reachGoal")).toHaveLength(1);
  });
  test("counts accepted SPA clicks whose router prevents default and retains the source page", async () => {
    const { win, calls, dom, doc } = browser("/", origin, '<a href="/products/">Products</a>');
    installAnalytics(win, analyticsConfig);
    doc.querySelector("a")!.addEventListener("click", (event) => {
      event.preventDefault();
      win.history.pushState({}, "", "/products/");
    });
    await click(dom, "a");
    expect(commands(calls, "reachGoal")).toEqual([
      [
        114594196,
        "reachGoal",
        "navigation_click",
        expect.objectContaining({ source_page: `${origin}/` }),
      ],
    ]);
  });
});
