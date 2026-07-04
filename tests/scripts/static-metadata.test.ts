import { describe, expect, test } from "vitest";
import { buildRobotsTxt, buildSitemapXml } from "../../scripts/generate-static-metadata";

describe("static metadata generation", () => {
  test("robots.txt includes the canonical sitemap URL", () => {
    expect(buildRobotsTxt("https://www.dmitrii-semenov-ie.studio")).toContain(
      "Sitemap: https://www.dmitrii-semenov-ie.studio/sitemap.xml",
    );
  });

  test("sitemap includes normalized route URLs", () => {
    const sitemap = buildSitemapXml("https://www.dmitrii-semenov-ie.studio", [
      "/",
      "/products",
      "/legal/privacy",
    ]);

    expect(sitemap).toContain("<loc>https://www.dmitrii-semenov-ie.studio/</loc>");
    expect(sitemap).toContain("<loc>https://www.dmitrii-semenov-ie.studio/products/</loc>");
    expect(sitemap).toContain("<loc>https://www.dmitrii-semenov-ie.studio/legal/privacy/</loc>");
  });
});
