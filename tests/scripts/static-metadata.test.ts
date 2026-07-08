import { describe, expect, test } from "vitest";
import { buildRobotsTxt, buildSitemapXml } from "../../scripts/generate-static-metadata";

describe("static metadata generation", () => {
  test("robots.txt includes the canonical sitemap URL", () => {
    expect(buildRobotsTxt("https://www.keyflare.studio")).toContain(
      "Sitemap: https://www.keyflare.studio/sitemap.xml",
    );
  });

  test("sitemap includes normalized route URLs", () => {
    const sitemap = buildSitemapXml("https://www.keyflare.studio", ["/", "/products", "/privacy"]);

    expect(sitemap).toContain("<loc>https://www.keyflare.studio/</loc>");
    expect(sitemap).toContain("<loc>https://www.keyflare.studio/products/</loc>");
    expect(sitemap).toContain("<loc>https://www.keyflare.studio/privacy/</loc>");
  });
});
