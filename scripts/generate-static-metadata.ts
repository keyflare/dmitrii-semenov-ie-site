import { mkdir, writeFile } from "node:fs/promises";

const origin = "https://www.dmitrii-semenov-ie.studio";
const publicDir = new URL("../public/", import.meta.url);

await mkdir(publicDir, { recursive: true });

await writeFile(
  new URL("robots.txt", publicDir),
  ["User-agent: *", "Allow: /", `Sitemap: ${origin}/sitemap.xml`, ""].join("\n"),
);

await writeFile(
  new URL("sitemap.xml", publicDir),
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <url><loc>${origin}/</loc></url>`,
    `</urlset>`,
    "",
  ].join("\n"),
);
