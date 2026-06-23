import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { sanityFetch } from "@/sanity/lib/live";
import { QUERY_ORDERS_BY_USER } from "@/sanity/queries/orders.query";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { OrdersGrid } from "./components/grid";

export const metadata: Metadata = {
  title: "Your Orders",
  description: `View your order history`,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Your Orders",
    siteName: siteConfig.title,
    description: `View your order history`,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Orders",
    description: `View your order history`,
    images: ["/twitter-image.png"],
  },
};

export default async function Orders() {
  const { userId } = await auth();

  const { data: orders } = await sanityFetch({
    query: QUERY_ORDERS_BY_USER,
    params: { clerkUserId: userId ?? "" },
  });

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Your Orders"
        description="Track your orders, review past purchases, and monitor delivery updates."
      />

      <OrdersGrid orders={orders} />
    </div>
  );
}
