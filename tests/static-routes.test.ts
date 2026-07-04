import { describe, expect, test } from "vitest";
import { getPrerenderPaths } from "../app/content/products/registry";

describe("static route paths", () => {
  test("includes the Task 2 static pages", () => {
    expect(getPrerenderPaths()).toEqual([
      "/",
      "/products",
      "/about",
      "/contact",
      "/legal",
      "/legal/privacy",
    ]);
  });
});
