import type { ReactNode } from "react";
import { Link } from "react-router";
import styles from "./PosterButton.module.css";

type PosterButtonProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  href?: string;
  rel?: string;
  size?: "compact" | "hero";
  target?: string;
  to?: string;
  tone?: "default" | "disabled" | "primary";
};

export function PosterButton({
  ariaLabel,
  children,
  className,
  href,
  rel,
  size = "compact",
  target,
  to,
  tone = "default",
}: PosterButtonProps) {
  const isInteractive = Boolean(to || href);
  const classes = [
    styles.posterButton,
    styles[size],
    styles[tone],
    isInteractive ? styles.interactive : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link className={classes} to={to} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        rel={target === "_blank" ? (rel ?? "noreferrer") : rel}
        target={target}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={classes} aria-label={ariaLabel}>
      {children}
    </span>
  );
}
