import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { products } from "../../app/content/products/registry";
import { stageProductSites } from "../../scripts/stage-product-sites";

const tempDirectories: string[] = [];
const pages = ["index.html", "privacy/index.html", "support/index.html", "terms/index.html"];
const ratebench = products.find((product) => product.slug === "ratebench")!;

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function prepareExport(files = pages) {
  const directory = await mkdtemp(join(tmpdir(), "keyflare-static-product-"));
  tempDirectories.push(directory);
  const source = join(directory, "source");
  const output = join(directory, "output");

  for (const file of files) {
    const path = join(source, "ratebench", file);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file);
  }

  return { source, output };
}

describe("static product exports", () => {
  test("copies a published export to its own product directory", async () => {
    const { source, output } = await prepareExport([...pages, "assets/styles.css"]);

    await stageProductSites([ratebench], source, output);

    await expect(
      readFile(join(output, "products/ratebench/privacy/index.html"), "utf8"),
    ).resolves.toBe("privacy/index.html");
    await expect(
      readFile(join(output, "products/ratebench/assets/styles.css"), "utf8"),
    ).resolves.toBe("assets/styles.css");
  });

  test.each(["draft", "fixture"] as const)("does not stage a %s export", async (status) => {
    const { source, output } = await prepareExport();

    await stageProductSites([{ ...ratebench, status }], source, output);

    await expect(readFile(join(output, "products/ratebench/index.html"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  test("rejects a published export with a missing required document", async () => {
    const { source, output } = await prepareExport(
      pages.filter((path) => !path.startsWith("privacy/")),
    );

    await expect(stageProductSites([ratebench], source, output)).rejects.toThrow(
      "privacy/index.html",
    );
  });

  test("rejects an export that would overwrite existing output", async () => {
    const { source, output } = await prepareExport();
    const destination = join(output, "products/ratebench/index.html");
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, "Studio page");

    await expect(stageProductSites([ratebench], source, output)).rejects.toThrow("overlaps");
    await expect(readFile(destination, "utf8")).resolves.toBe("Studio page");
  });

  test("rejects a page that is not declared for the product", async () => {
    const { source, output } = await prepareExport([...pages, "data-deletion/index.html"]);

    await expect(stageProductSites([ratebench], source, output)).rejects.toThrow(
      "data-deletion/index.html",
    );
  });
});
