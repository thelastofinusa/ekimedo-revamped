import { Badge } from "@/components/shadcn/badge";
import { Container } from "@/components/shared/container";
import { getOrderStatus } from "@/constants/order";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { QUERY_ORDER_BY_ID } from "@/sanity/queries/orders.query";
import { auth } from "@clerk/nextjs/server";
import { ChevronLeftIcon, MapPinIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderDetails(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const { userId } = await auth();

  const { data: order } = await sanityFetch({
    query: QUERY_ORDER_BY_ID,
    params: { id },
  });

  if (!order || order.clerkUserId !== userId) {
    return redirect("/pre-made");
  }

  const status = getOrderStatus(order.status);

  // Helper to get first image URL from snapshots
  const getFirstImage = (
    snapshots?: Array<{ _type: string; url: string | null }> | null,
  ) => {
    if (!snapshots) return "";
    const image = snapshots.find((s) => s._type === "image" && s.url);
    return image?.url || "";
  };

  // Calculate subtotal (sum of item prices * quantity)
  const subtotal =
    order.items?.reduce((sum, item) => {
      return sum + (item.priceAtPurchase || 0) * (item.quantity || 0);
    }, 0) || 0;

  return (
    <div className="py-28 lg:py-36">
      <Container size="sm" className="flex flex-col gap-8">
        {/* Breadcrumb + Back Link */}
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/orders"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ChevronLeftIcon className="size-4" />
            <span>Back to Orders</span>
          </Link>
          /<strong>#{order.orderNumber}</strong>
        </nav>

        {/* Main Grid: Items + Summary */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                Placed on {formatDate(order.createdAt, "datetime")}
              </p>
              <Badge
                className={cn(
                  "ml-2 flex items-center gap-1 border",
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

            <div className="divide-y rounded-md border shadow-xs">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  const imageUrl = getFirstImage(item.product?.snapshots);
                  return (
                    <div key={item._key} className="flex gap-4 p-4 md:p-6">
                      <Link
                        href={`/pre-made/${item.product?.slug}`}
                        className="bg-secondary relative h-20 w-20 shrink-0 overflow-hidden border shadow-xs"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <ShoppingBag className="size-6" />
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col justify-between gap-1 sm:flex-row">
                        <div>
                          <Link
                            href={`/pre-made/${item.product?.slug}`}
                            className="font-medium"
                          >
                            {item.product?.name || "Product"}
                          </Link>
                          <p className="text-muted-foreground text-sm">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-medium">
                          {formatPrice(
                            (item.priceAtPurchase || 0) * (item.quantity || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No items in this order.
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-md border shadow-xs p-6 space-y-4">
              <h2 className="text-foreground font-sans text-xs font-semibold tracking-widest uppercase">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>

              {/* Payment & Address */}
              <div className="border-t space-y-4 text-sm">
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-sm">Payment Method</p>
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      {order.paymentMethod || "Stripe"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-sm">Status</p>
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      <status.icon
                        className={cn(
                          "size-4",
                          status.value === "pending" && "animate-spin",
                        )}
                      />
                      <span>{status.label}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-sm">Email</p>
                    <p className="text-sm font-medium">{order.email}</p>
                  </div>
                </div>

                {order.address && (
                  <div className="bg-secondary/20 border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPinIcon className="text-muted-foreground size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Delivery Address
                      </span>
                    </div>

                    <address className="not-italic space-y-1 text-sm">
                      {order.address.name && (
                        <p className="font-medium text-foreground">
                          {order.address.name}
                        </p>
                      )}

                      {order.address.line1 && (
                        <p className="text-muted-foreground">
                          {order.address.line1}
                        </p>
                      )}

                      {order.address.line2 && (
                        <p className="text-muted-foreground">
                          {order.address.line2}
                        </p>
                      )}

                      {(order.address.city || order.address.postcode) && (
                        <p className="text-muted-foreground">
                          {[order.address.city, order.address.postcode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {order.address.country && (
                        <p className="text-muted-foreground">
                          {order.address.country}
                        </p>
                      )}
                    </address>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/pre-made"
              className="block w-full rounded-md bg-foreground px-6 py-3 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
