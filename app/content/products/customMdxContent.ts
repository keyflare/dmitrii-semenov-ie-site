import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import PaletteMasterOverview from "./palette-master/overview.mdx";
import PaletteMasterPrivacyExtra from "./palette-master/privacy-extra.mdx";
import PaletteMasterSupport from "./palette-master/support.mdx";
import type { ProductMdxContentKey } from "./types";

export type ProductMdxComponent = ComponentType<{
  components?: MDXComponents;
}>;

export const productMdxContent: Record<ProductMdxContentKey, ProductMdxComponent> = {
  "palette-master-overview": PaletteMasterOverview,
  "palette-master-support": PaletteMasterSupport,
  "palette-master-privacy-extra": PaletteMasterPrivacyExtra,
};

export function getProductMdxContent(key: ProductMdxContentKey) {
  return productMdxContent[key];
}
