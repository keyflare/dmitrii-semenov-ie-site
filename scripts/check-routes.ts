import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { getPublicPaths } from "../app/content/products/registry";
import { assertAnalyticsInstallation } from "./analytics-publication";

export async function checkRouteOutput(buildRoot: string) {
  const pages = getPublicPaths().map((route) => join(buildRoot, route, "index.html"));
  const requiredFiles = [
    ...pages,
    ...["404.html", "CNAME", "app-ads.txt", "robots.txt", "sitemap.xml", "site-analytics.js"].map(
      (file) => join(buildRoot, file),
    ),
  ];
  const errors: string[] = [];
  await Promise.all(
    requiredFiles.map(async (file) => {
      try {
        await access(file);
        if (pages.includes(file)) assertAnalyticsInstallation(await readFile(file, "utf8"), file);
      } catch (error) {
        errors.push(
          (error as NodeJS.ErrnoException).code === "ENOENT"
            ? `Missing required route output: ${file}`
            : (error as Error).message,
        );
      }
    }),
  );
  return errors.sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = await checkRouteOutput("build/client");
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Route output check passed (one shared analytics installation per public page).");
  }
}
