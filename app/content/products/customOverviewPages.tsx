import type { ComponentType } from "react";
import { PaletteMasterOverview } from "./palette-master/Overview";
import { RatebenchOverview } from "./ratebench/Overview";
import type { Product, ProductCustomOverviewKey } from "./types";

export type CustomProductOverviewProps = {
  product: Product;
};

export const customProductOverviewPages: Record<
  ProductCustomOverviewKey,
  ComponentType<CustomProductOverviewProps>
> = {
  "palette-master": PaletteMasterOverview,
  ratebench: RatebenchOverview,
};

export function getCustomProductOverview(key: ProductCustomOverviewKey) {
  return customProductOverviewPages[key];
}
