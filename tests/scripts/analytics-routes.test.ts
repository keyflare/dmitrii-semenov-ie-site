import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { getPublicPaths } from "../../app/content/products/registry";
import { installAnalyticsMarkup } from "../../scripts/analytics-publication";
import { checkRouteOutput } from "../../scripts/check-routes";

describe("public analytics output", () => {
  test("requires one shared installation on every public HTML page and preserves root files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-route-output-"));
    try {
      const validPage = installAnalyticsMarkup(
        "<!doctype html><html><head></head><body>Page</body></html>",
        "fixture.html",
      );
      for (const route of getPublicPaths()) {
        const file = join(dir, route, "index.html");
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, validPage);
      }
      for (const file of [
        "404.html",
        "CNAME",
        "app-ads.txt",
        "robots.txt",
        "sitemap.xml",
        "site-analytics.js",
      ])
        await writeFile(join(dir, file), "required");
      expect(await checkRouteOutput(dir)).toEqual([]);
      const product = join(dir, "products/ratebench/privacy/index.html");
      await writeFile(
        product,
        "<!doctype html><html><head></head><body>No analytics</body></html>",
      );
      const home = join(dir, "index.html");
      await writeFile(
        home,
        validPage.replace(
          "</body>",
          '<script data-site-analytics="shared" src="/site-analytics.js" defer></script></body>',
        ),
      );
      await rm(join(dir, "CNAME"));
      await rm(join(dir, "app-ads.txt"));
      const errors = await checkRouteOutput(dir);
      expect(errors).toHaveLength(4);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(`analytics in ${product}`),
          expect.stringContaining(`analytics in ${home}`),
          expect.stringContaining("CNAME"),
          expect.stringContaining("app-ads.txt"),
        ]),
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
