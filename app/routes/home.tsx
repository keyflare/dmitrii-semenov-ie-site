import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.brandName} - Software Products` },
  {
    name: "description",
    content: "Official product hub for Keyflare Studio apps and software.",
  },
];

export default function HomeRoute() {
  return (
    <PageHeader
      eyebrow="Product studio"
      title={siteConfig.brandName}
      description="Independent software products for mobile and desktop platforms."
    />
  );
}
