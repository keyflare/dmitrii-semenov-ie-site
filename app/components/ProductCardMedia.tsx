import { useEffect, useRef } from "react";
import type { ProductCardMedia as CardMedia, ProductType } from "~/content/products/types";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { attachProductCardOutline } from "./productCardOutline";
import styles from "./ProductCardMedia.module.css";

function CardImage({ media }: { media: CardMedia }) {
  const framed = media.kind === "iphone";
  const image = (
    <img
      className={framed ? styles.screen : styles.illustration}
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
  return framed ? <div className={styles.device}>{image}</div> : image;
}

export function ProductCardMedia({
  media,
  productType,
}: {
  media?: CardMedia;
  productType: ProductType;
}) {
  const artwork = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (artwork.current && ink.current)
      return attachProductCardOutline(artwork.current, ink.current);
  }, []);

  return (
    <>
      <div ref={artwork} className={styles.artwork} data-product-media={media?.kind}>
        {media ? <CardImage media={media} /> : <ProductPlaceholder kind={productType} />}
      </div>
      <canvas ref={ink} className={styles.ink} aria-hidden="true" />
    </>
  );
}
