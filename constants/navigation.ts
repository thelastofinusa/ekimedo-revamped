import { siteConfig } from "@/config/site.config";

type Route = {
  label: string;
  path: string;
  newTab?: boolean;
};

type HeaderRoute =
  | (Route & { subroutes?: Route[] })
  | {
      label: string;
      path?: string;
      subroutes: Route[];
    };

export const headerRoutes: HeaderRoute[] = [
  {
    label: "Pre-made Dresses",
    path: "/pre-made",
  },
  {
    label: "Inquiry",
    path: "/make-an-inquiry",
  },
  {
    label: "Book Consultation",
    path: "/consultations",
  },
  {
    label: "Pricing",
    path: "/pricing",
  },
  {
    label: "Discover",
    subroutes: [
      {
        label: "About Us",
        path: "/about-us",
      },
      {
        label: "Our Gallery",
        path: "/our-gallery",
      },
      {
        label: "Reviews",
        path: "/reviews",
      },
      {
        label: "Contact Us",
        path: "/contact-us",
      },
    ],
  },
];

const discoverRoute = headerRoutes.find(
  (item): item is { label: string; subroutes: Route[] } => "subroutes" in item,
);

export const footerRoutes = [
  {
    title: "Shop & Services",
    routes: headerRoutes.filter((item): item is Route => "path" in item),
  },
  {
    title: discoverRoute?.label ?? "About the Brand",
    routes: [
      ...(discoverRoute?.subroutes ?? []),
      {
        label: "Cancellation Policy",
        path: "/policies/cancellation",
      },
    ],
  },
  {
    title: "Get in Touch",
    routes: [
      {
        label: "(+1) 202-907-4865",
        path: `tel:+12029074865`,
        newTab: true,
      },
      {
        label: siteConfig.supportEmail,
        path: `mailto:${siteConfig.supportEmail}`,
        newTab: true,
      },
      {
        label: "Capitol Heights, Maryland, USA",
        path: "https://maps.app.goo.gl/aDtqB59JHJeUUfXz9",
        newTab: true,
      },
    ],
  },
];
