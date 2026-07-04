import { describe, expect, test } from "vitest";
import { getPrerenderPaths } from "../app/content/products/registry";

describe("static route paths", () => {
  test("includes static pages and published Palette Master pages", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining([
        "/",
        "/products",
        "/about",
        "/contact",
        "/legal",
        "/legal/privacy",
        "/products/palette-master",
        "/products/palette-master/privacy",
        "/products/palette-master/support",
      ]),
    );
  });
});
