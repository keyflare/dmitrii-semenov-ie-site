import { Link, useLocation, useResolvedPath, type LinkProps } from "react-router";
import { analyticsConfig } from "~/analytics/config";
import { findAnalyticsSite, type AnalyticsNavigationEvent } from "~/analytics/runtime";

// Crossing website ownership starts a new document with only its owning counter.
export function SiteLink({ reloadDocument, onClick, ...props }: LinkProps) {
  const location = useLocation();
  const destination = useResolvedPath(props.to);
  const sourceSite = findAnalyticsSite(analyticsConfig, location.pathname);
  const targetSite = findAnalyticsSite(analyticsConfig, destination.pathname);
  const crossesWebsite = sourceSite?.key !== targetSite?.key;
  const documentNavigation = reloadDocument || crossesWebsite;
  return (
    <Link
      {...props}
      reloadDocument={documentNavigation}
      onClick={(event) => {
        onClick?.(event);
        if (
          !documentNavigation &&
          !event.defaultPrevented &&
          event.button === 0 &&
          (!event.currentTarget.target || event.currentTarget.target === "_self") &&
          !event.metaKey &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          // React Router can await loaders before updating history. Record its accepted
          // action on the native event so delegation can distinguish cancellation.
          (event.nativeEvent as AnalyticsNavigationEvent).__keyflareNavigationAccepted = true;
        }
      }}
    />
  );
}
