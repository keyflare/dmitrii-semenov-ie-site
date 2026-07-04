import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { SiteShell } from "~/components/SiteShell";
import globalStyles from "~/styles/global.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: globalStyles }];

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
