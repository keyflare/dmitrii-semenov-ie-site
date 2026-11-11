import { resolve } from "node:path";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import sirv from "sirv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type Plugin } from "vite";
import { getProductPaths, getPublishedStaticProducts } from "./app/content/products/registry";

function staticProductSites(): Plugin {
  return {
    name: "static-product-sites",
    configureServer(server) {
      for (const product of getPublishedStaticProducts()) {
        const mount = `/products/${product.slug}`;
        const pagePaths = new Set(getProductPaths(product));
        const directory = resolve(server.config.root, "product-sites", product.slug);
        const serveSite = sirv(directory, { dev: true });

        server.middlewares.use(mount, (request, response, next) => {
          const url = new URL(request.originalUrl ?? "/", "http://localhost");
          if (pagePaths.has(url.pathname)) {
            response.writeHead(308, { Location: `${url.pathname}/${url.search}` });
            response.end();
            return;
          }

          return serveSite(request, response, next);
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [{ enforce: "pre", ...mdx() }, staticProductSites(), reactRouter(), tsconfigPaths()],
});
