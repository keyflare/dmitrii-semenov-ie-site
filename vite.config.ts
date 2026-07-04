import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{ enforce: "pre", ...mdx() }, reactRouter(), tsconfigPaths()],
});
