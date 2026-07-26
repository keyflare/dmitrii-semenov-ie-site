import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { GenericErrorPage } from "~/components/GenericErrorPage";
import { NotFoundPage } from "~/components/NotFoundPage";
import { SiteShell } from "~/components/SiteShell";
import { getRootErrorKind } from "~/rootError";
import globalStyles from "~/styles/global.css?url";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/brand/keyflare-studio-logo.svg" },
  { rel: "stylesheet", href: globalStyles },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}

export function RootHydrateFallback() {
  return (
    <SiteShell>
      <NotFoundPage />
    </SiteShell>
  );
}

export function HydrateFallback() {
  return <RootHydrateFallback />;
}

export function RootErrorBoundary({ error }: { error: unknown }) {
  return (
    <SiteShell>
      {getRootErrorKind(error) === "not-found" ? <NotFoundPage /> : <GenericErrorPage />}
    </SiteShell>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return <RootErrorBoundary error={error} />;
}
