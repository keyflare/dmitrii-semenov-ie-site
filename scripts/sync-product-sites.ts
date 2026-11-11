import { execFile } from "node:child_process";
import { lstatSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { getPublishedStaticProducts, products } from "../app/content/products/registry";
import {
  getProductSiteDirectory,
  productSiteCache,
  productSiteSources,
  validateProductSiteSources,
  type ProductSiteSource,
} from "./product-site-sources";

const run = promisify(execFile);

export async function fetchProductSite(
  remote: string,
  { tag, commit }: Pick<ProductSiteSource, "tag" | "commit">,
  output: string,
) {
  const destination = resolve(output);
  const parent = dirname(destination);
  await mkdir(parent, { recursive: true });
  const temporary = await mkdtemp(join(parent, ".fetch-"));
  const repository = join(temporary, "git");
  const archive = join(temporary, "site.tar");
  const exportDirectory = join(temporary, "site");
  const ref = `refs/tags/${tag}`;
  const git = (...args: string[]) =>
    run("git", ["-C", repository, ...args], { env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });

  try {
    await mkdir(repository);
    await git("init", "--bare", "--quiet");
    await git("check-ref-format", ref);
    await git("fetch", "--quiet", "--depth=1", "--no-tags", "--", remote, ref);

    const actual = (await git("rev-parse", "FETCH_HEAD^{commit}")).stdout.trim();
    if (actual !== commit) {
      throw new Error(`Tag ${tag} resolves to ${actual}; expected ${commit}.`);
    }
    if (lstatSync(destination, { throwIfNoEntry: false })?.isDirectory()) {
      return;
    }

    const entries = (await git("ls-tree", "-r", "-z", actual)).stdout.split("\0");
    if (entries.some((entry) => entry && !/^100(?:644|755) blob /.test(entry))) {
      throw new Error(`Tag ${tag} contains entries other than regular files.`);
    }

    await git("archive", "--format=tar", `--output=${archive}`, actual);
    await mkdir(exportDirectory);
    await run("tar", ["-xf", archive, "-C", exportDirectory]);
    try {
      await rename(exportDirectory, destination);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (code !== "ENOTEMPTY" && code !== "EEXIST") {
        throw error;
      }
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  const errors = validateProductSiteSources(products);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  for (const { slug } of getPublishedStaticProducts()) {
    const source = productSiteSources[slug];
    const remote = `https://github.com/${source.repository}.git`;
    await fetchProductSite(remote, source, getProductSiteDirectory(productSiteCache, slug));
    console.log(`Fetched ${slug} from ${source.repository}@${source.tag} (${source.commit}).`);
  }
}
