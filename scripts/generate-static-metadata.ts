import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { siteConfig } from "../app/content/site";
import { getPublicPaths } from "../app/content/products/registry";

const publicDir = new URL("../public/", import.meta.url);
// The legacy Russian article remains reachable and declares the locale-prefixed
// URL as canonical. Keep the alias out of the sitemap.
const sitemapAliases = new Set(["/products/wgportal/blog/amneziawg-vs-wireguard/ru/"]);

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
    ...paths
      .map(normalizeSitemapPath)
      .filter((path) => !sitemapAliases.has(path))
      .map((path) => `  <url><loc>${canonicalOrigin}${path}</loc></url>`),
    `</urlset>`,
    "",
  ].join("\n");
}

export async function writeStaticMetadata() {
  await mkdir(publicDir, { recursive: true });

  await writeFile(new URL("robots.txt", publicDir), buildRobotsTxt(siteConfig.canonicalOrigin));

  await writeFile(
    new URL("sitemap.xml", publicDir),
    buildSitemapXml(siteConfig.canonicalOrigin, getPublicPaths()),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeStaticMetadata();
}
