import { Container } from "@/components/shared/container";
import { HeroComp } from "@/components/shared/hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { siteConfig } from "@/config/site.config";
import { getOrderStatus } from "@/constants/status";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDERS_BY_USER_QUERY } from "@/sanity/queries/orders";
import { auth } from "@clerk/nextjs/server";
import { ChevronRightIcon, ShoppingBagIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsInbox } from "react-icons/bs";

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

export default async function MyOrders() {
  const { userId } = await auth();

  const { data: orders } = await sanityFetch({
    query: ORDERS_BY_USER_QUERY,
    params: { clerkUserId: userId ?? "" },
  });

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Your Orders"
        description="Keep track of order statuses, examine previous purchases, and monitor delivery progress from the point of checkout to the point of arrival."
      />

      <div className="py-24 lg:py-32">
        <Container>
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              {orders.map((order) => {
                const status = getOrderStatus(order.status);
                const images = (order.itemImages ?? []).filter(
                  (url): url is string => Boolean(url),
                );

                const displayImage = images[0]; // single image
                const totalItems = order.itemCount ?? images.length;
                const extraCount = Math.max(totalItems - 1, 0);

                return (
                  <Link
                    key={order._id}
                    href={`/my-orders/${order._id}`}
                    className="bg-card group border-border block h-auto space-y-5 overflow-hidden rounded-md border p-6 shadow-xs md:p-8"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="bg-border/20 relative flex size-24 items-center justify-center overflow-hidden border shadow-xs">
                        {displayImage.length === 0 ? (
                          <ShoppingBagIcon className="text-muted-foreground size-8" />
                        ) : (
                          <React.Fragment>
                            <Image
                              src={displayImage}
                              alt=""
                              fill
                              quality={100}
                              loading="lazy"
                              className="object-cover"
                            />
                            {extraCount > 0 && (
                              <div className="bg-foreground text-background absolute right-1.5 bottom-1.5 flex size-8 items-center justify-center border-2 text-sm font-medium">
                                +{extraCount}
                              </div>
                            )}
                          </React.Fragment>
                        )}
                      </div>

                      {/* Right: Order Details */}
                      <div className="flex min-w-0 flex-1 flex-col py-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Order #{order.orderNumber}
                          </p>
                          <Badge
                            className={cn(
                              "flex items-center gap-1 border",
                              status.className,
                            )}
                          >
                            <status.icon
                              className={cn(
                                "size-3.5!",
                                status.value === "pending" && "animate-spin",
                              )}
                            />
                            <span className="font-sans text-xs font-medium">
                              {status.label}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-0.5 mb-6 text-xs font-medium sm:mb-4">
                          {formatDate(order.createdAt, "datetime")}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <p className="text-muted-foreground text-sm">
                            Total of <strong>{order.itemCount}</strong>{" "}
                            {order.itemCount === 1 ? "item" : "items"}
                          </p>
                          <p className="text-foreground text-lg font-semibold">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer: View Details */}
                    <div className="flex items-center justify-between gap-6 border-t pt-3">
                      <p className="text-muted-foreground truncate text-sm">
                        {order.itemNames
                          ?.slice(0, 2)
                          .filter(Boolean)
                          .join(", ")}
                        {(order.itemNames?.length ?? 0) > 2 && "..."}
                      </p>
                      <p className="flex shrink-0 items-center gap-1 text-sm font-medium transition-colors">
                        <span>View order</span>
                        <ChevronRightIcon className="mt-0.5 size-4.5 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto w-full">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BsInbox />
                  </EmptyMedia>
                  <EmptyTitle>No orders yet</EmptyTitle>
                  <EmptyDescription>
                    When you place an order, it will appear here.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    href="/pre-made-dresses"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Start Shopping
                  </Link>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
