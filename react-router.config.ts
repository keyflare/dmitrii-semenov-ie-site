import type { Config } from "@react-router/dev/config";
import { getPrerenderPaths } from "./app/content/products/registry";

export default {
  ssr: false,
  async prerender() {
    return getPrerenderPaths();
  },
} satisfies Config;
