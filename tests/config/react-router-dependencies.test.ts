import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

type PackageManifest = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe("React Router dependency alignment", () => {
  test("pins framework packages to the same exact version", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as PackageManifest;
    const versions = [
      manifest.dependencies["react-router"],
      manifest.dependencies["@react-router/node"],
      manifest.devDependencies["@react-router/dev"],
    ];

    expect(new Set(versions)).toEqual(new Set(["8.1.0"]));
  });
});
