import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { siteConfig } from "../app/content/site";
import { getPrerenderPaths } from "../app/content/products/registry";

const publicDir = new URL("../public/", import.meta.url);

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

function normalizeSitemapPath(path: string) {
  if (path === "/") {
    return "/";
  }

  return `${path.replace(/\/+$/, "")}/`;
}

export function buildRobotsTxt(origin: string) {
  const canonicalOrigin = normalizeOrigin(origin);

  return ["User-agent: *", "Allow: /", `Sitemap: ${canonicalOrigin}/sitemap.xml`, ""].join("\n");
}

export function buildSitemapXml(origin: string, paths: string[]) {
  const canonicalOrigin = normalizeOrigin(origin);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...paths.map(
      (path) => `  <url><loc>${canonicalOrigin}${normalizeSitemapPath(path)}</loc></url>`,
    ),
    `</urlset>`,
    "",
  ].join("\n");
}

export async function writeStaticMetadata() {
  await mkdir(publicDir, { recursive: true });

  await writeFile(new URL("robots.txt", publicDir), buildRobotsTxt(siteConfig.canonicalOrigin));

  await writeFile(
    new URL("sitemap.xml", publicDir),
    buildSitemapXml(siteConfig.canonicalOrigin, getPrerenderPaths()),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeStaticMetadata();
}
