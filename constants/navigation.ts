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
    path: "/pre-made-dresses",
  },
  {
    label: "Inquiry",
    path: "/make-an-inquiry",
  },
  {
    label: "Book Consultation",
    path: "/book-consultation",
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
        path: "/about",
      },
      {
        label: "Our Gallery",
        path: "/gallery",
      },
      {
        label: "Testimonials",
        path: "/testimonials",
      },
      {
        label: "Let's Talk",
        path: "/contact",
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
        path: "/cancellation-policy",
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
        label: process.env.NEXT_PUBLIC_RESEND_INFO_EMAIL,
        path: `mailto:${process.env.NEXT_PUBLIC_RESEND_INFO_EMAIL}`,
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
