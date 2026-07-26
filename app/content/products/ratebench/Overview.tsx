import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { CustomProductOverviewProps } from "../customOverviewPages";
import styles from "./Overview.module.css";

const features = [
  {
    number: "01",
    title: "Fiat & crypto",
    body: "Compare fiat currencies and search thousands of crypto assets in one focused utility.",
  },
  {
    number: "02",
    title: "Multi-step calculations",
    body: "Model a chain of exchanges with entered rates and fees, then inspect the effective result.",
  },
  {
    number: "03",
    title: "Local history",
    body: "Keep calculation records, optional notes, recent assets, and preferences on your device.",
  },
];

const benchmarkSteps = [
  { step: "01", pair: "USD / EUR", market: "0.920", effective: "0.900" },
  { step: "02", pair: "EUR / USDT", market: "1.080", effective: "1.050" },
];

export function RatebenchOverview({ product }: CustomProductOverviewProps) {
  const themeStyle = product.theme
    ? ({
        "--product-accent-primary": product.theme.accentPrimary,
        "--product-accent-secondary": product.theme.accentSecondary,
        "--product-accent-tertiary": product.theme.accentTertiary,
        "--product-ink": product.theme.ink,
        "--product-surface": product.theme.surface,
        "--product-gradient": product.theme.gradient,
      } as CSSProperties)
    : undefined;
  const feedbackUrl = `mailto:${product.supportEmail}?subject=${encodeURIComponent(
    "Ratebench feedback",
  )}`;

  return (
    <article className={styles.overview} style={themeStyle}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.productIdentity}>
            <img
              className={styles.logo}
              src="/products/ratebench/ratebench-logo.svg"
              alt=""
              loading="eager"
            />
            <div className={styles.brandLockup}>
              <h1 className={styles.title}>Ratebench</h1>
              <span>Mobile app · Android & iOS</span>
            </div>
          </div>
          <p className={styles.status}>In development</p>
          <p className={styles.tagline}>Compare every step.</p>
          <p className={styles.lede}>
            Ratebench is a reference and calculation tool for fiat and crypto assets. Compare a
            single conversion or model a chain of exchanges with rates, fees, and effective outcomes
            in one view.
          </p>
          <nav className={styles.heroLinks} aria-label="Ratebench links">
            <a className={styles.primaryLink} href={feedbackUrl}>
              Send feedback
            </a>
            <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
            <Link to={`/products/${product.slug}/terms/`}>Terms</Link>
            <Link to={`/products/${product.slug}/support/`}>Support</Link>
          </nav>
        </div>

        <div className={styles.ledger} aria-label="Illustrative multi-step exchange calculation">
          <div className={styles.ledgerHeader}>
            <span>Exchange benchmark</span>
            <span className={styles.signal} aria-hidden="true" />
          </div>
          <div className={styles.route}>
            <span>Route</span>
            <strong>USD → EUR → USDT</strong>
          </div>
          <table className={styles.benchmarkTable}>
            <caption>Market and effective rates for an illustrative exchange route</caption>
            <colgroup>
              <col />
              <col className={styles.rateColumn} />
              <col className={styles.rateColumn} />
            </colgroup>
            <thead>
              <tr className={styles.benchmarkColumns}>
                <th scope="col">Operation</th>
                <th scope="col">Market</th>
                <th scope="col">Effective</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkSteps.map((row) => (
                <tr key={row.step} className={styles.ledgerRow}>
                  <th className={styles.operation} scope="row">
                    <span>{row.step}</span>
                    <strong>{row.pair}</strong>
                  </th>
                  <td className={styles.ledgerValue}>
                    <strong>{row.market}</strong>
                  </td>
                  <td className={styles.ledgerValue}>
                    <strong>{row.effective}</strong>
                  </td>
                </tr>
              ))}
              <tr className={styles.result}>
                <th className={styles.operation} scope="row">
                  <span>Whole route</span>
                  <strong>USD / USDT</strong>
                </th>
                <td className={styles.ledgerValue}>
                  <strong>0.994</strong>
                </td>
                <td className={styles.ledgerValue}>
                  <strong>0.945</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className={styles.illustrationNote}>Illustrative values — not live market data.</p>
        </div>
      </section>

      <section className={styles.features} aria-label="Ratebench features">
        {features.map((feature) => (
          <div className={styles.feature} key={feature.number}>
            <span>{feature.number}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </div>
        ))}
      </section>

      <section className={styles.availability} aria-label="Platform availability">
        <div>
          <span>Android</span>
          <strong>In development</strong>
        </div>
        <div>
          <span>iOS</span>
          <strong>In development</strong>
        </div>
      </section>

      <section className={styles.disclaimer}>
        <div className={styles.disclaimerMeta}>
          <span>Important</span>
          <span>Reference only</span>
        </div>
        <div className={styles.disclaimerContent}>
          <h2>Reference, not advice</h2>
          <p>
            Ratebench is not a financial institution, exchange, broker, wallet, or adviser. Rates
            and calculations are informational estimates; verify them with the relevant provider
            before making a financial decision.
          </p>
        </div>
      </section>
    </article>
  );
}
