import { access } from "node:fs/promises";

const requiredFiles = [
  "build/client/index.html",
  "build/client/products/index.html",
  "build/client/about/index.html",
  "build/client/contact/index.html",
  "build/client/legal/index.html",
  "build/client/legal/privacy/index.html",
  "build/client/CNAME",
  "build/client/app-ads.txt",
  "build/client/robots.txt",
  "build/client/sitemap.xml",
];

await Promise.all(requiredFiles.map((file) => access(file)));

console.log("Route output check passed.");
