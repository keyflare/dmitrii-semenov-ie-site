import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, expect, test } from "vitest";
import { fetchProductSite } from "../../scripts/sync-product-sites";

const tempDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "keyflare-product-git-"));
  tempDirectories.push(root);
  const git = (...args: string[]) =>
    execFileSync(
      "git",
      ["-C", root, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();

  git("init", "--quiet");
  await writeFile(join(root, "index.html"), "First site release");
  git("add", "index.html");
  git("commit", "--quiet", "-m", "First site release");
  const commit = git("rev-parse", "HEAD");
  git("tag", "-a", "site-v1.0.0", "-m", "First site release");

  await writeFile(join(root, "index.html"), "Unreleased change");
  git("commit", "--quiet", "-am", "Unreleased change");
  return { root, commit, output: join(root, "export"), git };
}

test("fetches the exact annotated tag and exports only its files", async () => {
  const { root, commit, output } = await fixture();
  await fetchProductSite(root, { tag: "site-v1.0.0", commit }, relative(process.cwd(), output));

  await expect(readFile(join(output, "index.html"), "utf8")).resolves.toBe("First site release");
  await expect(readFile(join(output, ".git", "config"), "utf8")).rejects.toMatchObject({
    code: "ENOENT",
  });
});

test("rejects a tag whose commit differs from the pinned commit", async () => {
  const { root, output } = await fixture();
  await expect(
    fetchProductSite(root, { tag: "site-v1.0.0", commit: "a".repeat(40) }, output),
  ).rejects.toThrow("site-v1.0.0");
  await expect(readFile(join(output, "index.html"))).rejects.toMatchObject({ code: "ENOENT" });
});

test("exports the website subtree from a monorepo release tag", async () => {
  const { root, output, git } = await fixture();
  const directory = "site/public";
  await mkdir(join(root, directory), { recursive: true });
  await writeFile(join(root, directory, "index.html"), "Website stored on trunk");
  await writeFile(join(root, "mobile.txt"), "Mobile application source");
  git("add", directory, "mobile.txt");
  git("commit", "--quiet", "-m", "Add website directory to trunk");
  const commit = git("rev-parse", "HEAD");
  git("tag", "-a", "site-v1.0.1", "-m", "Website release from trunk");

  await fetchProductSite(root, { tag: "site-v1.0.1", commit, directory }, output);

  await expect(readFile(join(output, "index.html"), "utf8")).resolves.toBe(
    "Website stored on trunk",
  );
  await expect(readFile(join(output, "mobile.txt"))).rejects.toMatchObject({ code: "ENOENT" });
});
