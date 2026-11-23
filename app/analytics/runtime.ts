// This module is also transpiled as the standalone browser runtime for imported sites.
// Keep it self-contained: only type imports are allowed here.
export type AnalyticsConfig = {
  origin: string;
  sites: { key: string; counterId: number; paths: string[] }[];
};
export type AnalyticsNavigationEvent = MouseEvent & { __keyflareNavigationAccepted?: boolean };
type Metrica = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
export type AnalyticsWindow = Window &
  typeof globalThis & {
    ym?: Metrica;
    __keyflareAnalytics?: boolean;
  };

export function findAnalyticsSite(config: AnalyticsConfig, href: string) {
  const url = new URL(href, config.origin);
  if (url.origin !== config.origin) return undefined;
  return config.sites.find((site) =>
    site.paths.some(
      (path) => url.pathname === path || (path !== "/" && url.pathname === `${path}/`),
    ),
  );
}

export function installAnalytics(win: AnalyticsWindow, config: AnalyticsConfig) {
  if (win.__keyflareAnalytics || win.location.origin !== config.origin) return;
  win.__keyflareAnalytics = true;
  const doc = win.document;
  const initialized = new Set<number>();
  let navigationSerial = 0;
  let previousPage = "";
  let observedHref = win.location.href;
  let restoredHref: string | undefined;
  const acquisitionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
  ];

  function sanitize(href: string): string | undefined {
    let url: URL;
    try {
      url = new URL(href, win.location.href);
    } catch {
      return;
    }
    if (url.protocol === "mailto:" || url.protocol === "tel:")
      return `${url.protocol}${url.pathname}`;
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    const query = new URLSearchParams();
    for (const key of acquisitionKeys) {
      const value = url.searchParams.get(key);
      if (value && value.length <= 128) query.set(key, value);
    }
    if (url.hostname === "play.google.com") {
      const id = url.searchParams.get("id");
      if (id && /^[a-zA-Z0-9_.]+$/.test(id)) query.set("id", id);
    }
    url.username = "";
    url.password = "";
    url.hash = "";
    url.search = query.toString();
    if (findAnalyticsSite(config, url.href) && url.pathname !== "/") {
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    }
    return url.href;
  }

  const initialReferrer = doc.referrer ? (sanitize(doc.referrer) ?? "") : "";

  function counter() {
    const site = findAnalyticsSite(config, win.location.href);
    if (!site?.counterId) return;
    if (!win.ym) {
      const queue: Metrica = (...args) => {
        (queue.a ??= []).push(args);
      };
      queue.l = Date.now();
      win.ym = queue;
    }
    if (!doc.querySelector('script[src="https://mc.yandex.ru/metrika/tag.js"]')) {
      const script = doc.createElement("script");
      script.async = true;
      script.src = "https://mc.yandex.ru/metrika/tag.js";
      doc.head.append(script);
    }
    if (!initialized.has(site.counterId)) {
      initialized.add(site.counterId);
      win.ym(site.counterId, "init", {
        defer: true,
        disableYtm: true,
        webvisor: false,
        clickmap: false,
        trackLinks: false,
        trackHash: false,
        ecommerce: false,
        accurateTrackBounce: false,
        sendTitle: false,
        url: sanitize(win.location.href),
        referrer: initialReferrer,
      });
    }
    return site;
  }

  function pageview() {
    const page = sanitize(win.location.href);
    const site = counter();
    if (site && page) {
      win.ym!(site.counterId, "hit", page, {
        referer: previousPage || initialReferrer,
        params: { website: site.key },
      });
    }
    previousPage = page ?? "";
  }

  for (const method of ["pushState", "replaceState"] as const) {
    const original = win.history[method];
    win.history[method] = function (...args: Parameters<History[typeof method]>) {
      const before = win.location.href;
      const beforePage = sanitize(before);
      original.apply(this, args);
      restoredHref = undefined;
      navigationSerial += 1;
      const after = win.location.href;
      observedHref = after;
      const changedPage = beforePage !== sanitize(after);
      // New entries at the same URL are valid revisits. Hash/query-only edits are not pages.
      if (changedPage || (method === "pushState" && before === after)) {
        pageview();
      }
    };
  }
  win.addEventListener("popstate", () => {
    const href = win.location.href;
    // Restoration can dispatch pageshow and popstate for the same traversal.
    if (restoredHref === href) {
      restoredHref = undefined;
      observedHref = href;
      return;
    }
    const isNavigation = sanitize(observedHref) !== sanitize(href) || observedHref === href;
    observedHref = href;
    if (isNavigation) {
      navigationSerial += 1;
      pageview();
    }
  });
  win.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      restoredHref = win.location.href;
      pageview();
      win.setTimeout(() => {
        restoredHref = undefined;
      }, 0);
    }
  });

  const interactions = new WeakMap<MouseEvent, () => void>();
  function captureInteraction(event: MouseEvent) {
    if (
      (event.type === "click" && event.button !== 0) ||
      (event.type === "auxclick" && event.button !== 1)
    )
      return;
    const target = event.target instanceof win.Element ? event.target : null;
    const element = target?.closest<HTMLElement>('a[href], button, [role="button"]');
    if (!element || element.closest('[disabled], [aria-disabled="true"], [inert]')) return;
    const anchor = element instanceof win.HTMLAnchorElement ? element : undefined;
    if (event.type === "auxclick" && !anchor) return;
    const site = findAnalyticsSite(config, win.location.href);
    if (!site?.counterId) return;
    const sourcePage = sanitize(win.location.href);
    const destination = anchor ? sanitize(anchor.href) : undefined;
    if (anchor && !destination) return;
    let goal = "button_click";
    if (anchor) {
      const url = new URL(destination!);
      goal =
        url.hostname === "play.google.com"
          ? "google_play_click"
          : url.hostname === "apps.apple.com"
            ? "app_store_click"
            : url.protocol === "mailto:" || url.protocol === "tel:"
              ? "support_click"
              : url.origin === config.origin
                ? "navigation_click"
                : "outbound_click";
    }
    const text = (value: string | null | undefined) =>
      value?.replace(/\s+/g, " ").trim().slice(0, 80) || undefined;
    const safeText =
      !element.closest("form, [contenteditable]") &&
      !element.querySelector("input, textarea, select, [contenteditable]")
        ? element.textContent
        : undefined;
    const label =
      text(element.dataset.analyticsLabel || element.getAttribute("aria-label") || safeText) ??
      element.tagName.toLowerCase();
    const region = element.closest("[data-analytics-location], nav, header, footer, section, main");
    const params = {
      website: site.key,
      product: site.key === "studio" ? undefined : site.key,
      source_page: sourcePage,
      destination,
      element_id: text(element.dataset.analyticsId || element.id) ?? label,
      label,
      location:
        text(
          region?.getAttribute("data-analytics-location") ||
            region?.getAttribute("aria-label") ||
            region?.id,
        ) ??
        region?.tagName.toLowerCase() ??
        "page",
      action: goal.replace(/_click$/, ""),
    };
    const serial = navigationSerial;
    // Snapshot source metadata in capture, but never report from capture or a capture
    // microtask: trusted browser events can flush microtasks before target handlers.
    interactions.set(event, () => {
      if (
        !event.defaultPrevented ||
        (event as AnalyticsNavigationEvent).__keyflareNavigationAccepted ||
        (anchor && serial !== navigationSerial)
      ) {
        win.ym?.(site.counterId, "reachGoal", goal, params);
      }
    });
  }
  function reportInteraction(event: MouseEvent) {
    const report = interactions.get(event);
    interactions.delete(event);
    report?.();
  }
  for (const type of ["click", "auxclick"] as const) {
    doc.addEventListener(type, captureInteraction, true);
    // React Router hydrates at document and may register its dispatcher after us.
    // Window bubble always follows document handlers, including their cancellation.
    win.addEventListener(type, reportInteraction);
  }
  pageview();
}
