import { access } from "node:fs/promises";

const requiredFiles = [
  "build/client/index.html",
  "build/client/CNAME",
  "build/client/app-ads.txt",
  "build/client/robots.txt",
  "build/client/sitemap.xml",
];

await Promise.all(requiredFiles.map((file) => access(file)));

console.log("Route output check passed.");
