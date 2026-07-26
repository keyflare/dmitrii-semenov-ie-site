import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import PaletteMasterOverview from "./palette-master/overview.mdx";
import PaletteMasterPrivacy from "./palette-master/privacy.mdx";
import PaletteMasterSupport from "./palette-master/support.mdx";
import RatebenchPrivacy from "./ratebench/privacy.mdx";
import RatebenchSupport from "./ratebench/support.mdx";
import RatebenchTerms from "./ratebench/terms.mdx";
import type { ProductMdxContentKey } from "./types";

export type ProductMdxComponent = ComponentType<{
  components?: MDXComponents;
}>;

export const productMdxContent: Record<ProductMdxContentKey, ProductMdxComponent> = {
  "palette-master-overview": PaletteMasterOverview,
  "palette-master-support": PaletteMasterSupport,
  "palette-master-privacy": PaletteMasterPrivacy,
  "ratebench-support": RatebenchSupport,
  "ratebench-privacy": RatebenchPrivacy,
  "ratebench-terms": RatebenchTerms,
};

export function getProductMdxContent(key: ProductMdxContentKey) {
  return productMdxContent[key];
}
