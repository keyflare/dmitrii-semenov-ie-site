import { mkdir, writeFile } from "node:fs/promises";
import { siteConfig } from "../app/content/site";
import { getPrerenderPaths } from "../app/content/products/registry";

const publicDir = new URL("../public/", import.meta.url);

await mkdir(publicDir, { recursive: true });

await writeFile(
  new URL("robots.txt", publicDir),
  ["User-agent: *", "Allow: /", `Sitemap: ${siteConfig.canonicalOrigin}/sitemap.xml`, ""].join(
    "\n",
  ),
);

await writeFile(
  new URL("sitemap.xml", publicDir),
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...getPrerenderPaths().map(
      (path) => `  <url><loc>${siteConfig.canonicalOrigin}${path}</loc></url>`,
    ),
    `</urlset>`,
    "",
  ].join("\n"),
);
