import type { CustomProductOverviewProps } from "../customOverviewPages";

export function RatebenchOverview({ product }: CustomProductOverviewProps) {
  return <article>{product.name}</article>;
}
