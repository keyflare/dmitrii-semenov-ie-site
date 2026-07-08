import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("products", "./routes/products-index.tsx"),
  route("products/:slug", "./routes/product-overview.tsx"),
  route("products/:slug/privacy", "./routes/product-privacy.tsx"),
  route("products/:slug/support", "./routes/product-support.tsx"),
  route("products/:slug/data-deletion", "./routes/product-data-deletion.tsx"),
  route("contact", "./routes/contact.tsx"),
  route("legal", "./routes/legal.tsx"),
  route("legal/privacy", "./routes/legal-privacy.tsx"),
] satisfies RouteConfig;
