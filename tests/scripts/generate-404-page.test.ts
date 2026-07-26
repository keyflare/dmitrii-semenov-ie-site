import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generate404Page } from "../../scripts/generate-404-page";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generate404Page", () => {
  test("copies the React Router SPA fallback byte-for-byte", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-404-"));
    tempDirs.push(dir);
    const source = join(dir, "__spa-fallback.html");
    const destination = join(dir, "404.html");
    await writeFile(source, "<html><body>fallback</body></html>");

    await generate404Page(source, destination);

    expect(await readFile(destination, "utf8")).toBe("<html><body>fallback</body></html>");
  });

  test("fails when React Router did not emit the fallback", async () => {
    const dir = await mkdtemp(join(tmpdir(), "keyflare-404-"));
    tempDirs.push(dir);

    await expect(
      generate404Page(join(dir, "__spa-fallback.html"), join(dir, "404.html")),
    ).rejects.toThrow(/Missing React Router SPA fallback/);
  });
});
