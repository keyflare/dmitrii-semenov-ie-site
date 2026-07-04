import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import type { CustomProductOverviewProps } from "../customOverviewPages";

export function PaletteMasterOverview({ product }: CustomProductOverviewProps) {
  return (
    <>
      <PageHeader
        eyebrow="Mobile game"
        title={product.name}
        description={product.shortDescription}
      />
      <p>Palette Master is a color-focused mobile game for iOS and Android.</p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      <p>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </p>
    </>
  );
}
