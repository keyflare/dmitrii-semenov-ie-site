import { access } from "node:fs/promises";
import { getPrerenderPaths } from "../app/content/products/registry";

function routeToBuildFile(route: string) {
  if (route === "/") {
    return "build/client/index.html";
  }

  return `build/client/${route.replace(/^\/+|\/+$/g, "")}/index.html`;
}

const requiredFiles = [
  ...getPrerenderPaths().map(routeToBuildFile),
  "build/client/404.html",
  "build/client/CNAME",
  "build/client/app-ads.txt",
  "build/client/robots.txt",
  "build/client/sitemap.xml",
];

const missingFiles: string[] = [];

await Promise.all(
  requiredFiles.map(async (file) => {
    try {
      await access(file);
    } catch {
      missingFiles.push(file);
    }
  }),
);

if (missingFiles.length > 0) {
  console.error("Missing required route output files:");
  for (const file of [...missingFiles].sort()) {
    console.error(`- ${file}`);
  }

  process.exit(1);
}

console.log("Route output check passed.");
