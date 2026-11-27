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

  test("sitemap excludes the legacy Russian alias and keeps its canonical article", () => {
    const canonical = "/products/wgportal/ru/blog/amneziawg-vs-wireguard";
    const alias = "/products/wgportal/blog/amneziawg-vs-wireguard/ru";
    const sitemap = buildSitemapXml("https://www.keyflare.studio", [
      canonical,
      alias,
      `${alias}/`,
      "/products/wgportal/blog/amneziawg-vs-wireguard",
    ]);

    expect(sitemap).toContain(`<loc>https://www.keyflare.studio${canonical}/</loc>`);
    expect(sitemap).toContain(
      "<loc>https://www.keyflare.studio/products/wgportal/blog/amneziawg-vs-wireguard/</loc>",
    );
    expect(sitemap).not.toContain(`${alias}/</loc>`);
  });
});
