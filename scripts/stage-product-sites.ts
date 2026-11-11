import { lstatSync } from "node:fs";
import { cp, lstat, readdir } from "node:fs/promises";
import { join, posix } from "node:path";
import { pathToFileURL } from "node:url";
import {
  getProductPaths,
  getPublishedStaticProducts,
  products,
} from "../app/content/products/registry";
import type { Product, StaticProduct } from "../app/content/products/types";

async function listFiles(root: string, directory = ""): Promise<string[]> {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const path = posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await listFiles(root, path)));
    } else if (entry.isFile()) {
      paths.push(path);
    } else {
      throw new Error(`Static site export must contain ordinary files: ${join(root, path)}`);
    }
  }

  return paths;
}

async function validateExport(product: StaticProduct, source: string) {
  if (!(await lstat(source)).isDirectory()) {
    throw new Error(`Expected a static export directory at ${source}`);
  }

  const files = await listFiles(source);
  const prefix = `/products/${product.slug}`;
  const expectedPages = getProductPaths(product).map((path) =>
    posix.join(path.slice(prefix.length + 1), "index.html"),
  );

  for (const page of expectedPages) {
    if (!files.includes(page)) {
      throw new Error(`Static export for ${product.slug} is missing ${page}`);
    }
  }

  for (const file of files) {
    if (/\.html?$/i.test(file) && !expectedPages.includes(file)) {
      throw new Error(`Static export for ${product.slug} contains an undeclared page: ${file}`);
    }
  }
}

export async function stageProductSites(
  registry: Product[],
  sourceRoot: string,
  buildRoot: string,
) {
  for (const product of getPublishedStaticProducts(registry)) {
    const source = join(sourceRoot, product.slug);
    const destination = join(buildRoot, "products", product.slug);

    await validateExport(product, source);
    if (lstatSync(destination, { throwIfNoEntry: false })) {
      throw new Error(`Static export for ${product.slug} overlaps existing output: ${destination}`);
    }

    await cp(source, destination, { recursive: true, errorOnExist: true, force: false });
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  await stageProductSites(products, "product-sites", "build/client");
  console.log("Staged published static product sites.");
}
