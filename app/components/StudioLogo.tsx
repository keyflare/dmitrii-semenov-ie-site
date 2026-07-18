import styles from "./StudioLogo.module.css";

type StudioLogoProps = {
  asset?: "square" | "rectangular";
  className?: string;
  label?: string;
  loading?: "eager" | "lazy";
  variant?: "plain" | "framed";
};

const logoSources = {
  square: "/brand/keyflare-studio-logo.svg",
  rectangular: "/brand/keyflare-studio-logo-rect.svg",
} as const;

export function StudioLogo({
  asset = "square",
  className,
  label,
  loading = "eager",
  variant = "plain",
}: StudioLogoProps) {
  const classes = [styles.logo, styles[variant], styles[asset], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <img
        className={styles.image}
        src={logoSources[asset]}
        alt={label ?? ""}
        aria-hidden={label ? undefined : true}
        decoding="async"
        loading={loading}
      />
    </span>
  );
}
