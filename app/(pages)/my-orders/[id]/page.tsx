import { Container } from "@/components/shared/container";
import { getOrderStatus } from "@/constants/status";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDER_BY_ID_QUERY } from "@/sanity/queries/orders";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import {
  ChevronLeftIcon,
  CreditCardIcon,
  MapPinnedIcon,
  ShoppingBagIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderDetailsPage(
  props: PageProps<"/my-orders/[id]">,
) {
  const { id } = await props.params;
  const { userId } = await auth();

  const { data: order } = await sanityFetch({
    query: ORDER_BY_ID_QUERY,
    params: { id },
  });

  // Verify order exists and belongs to current user
  if (!order || order.clerkUserId !== userId)
    return redirect("/pre-made-dresses");

  const status = getOrderStatus(order.status);

  return (
    <div className="py-24 lg:py-32">
      <Container size="sm">
        <div className="mb-8">
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 text-sm"
          >
            <ChevronLeftIcon className="size-4.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-bold sm:text-2xl md:text-3xl">
                {order.orderNumber}
              </h1>
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
            <p className="text-sm">
              Placed on {formatDate(order.createdAt, "datetime")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="bg-card group border-border block h-auto overflow-hidden border shadow-xs">
              <p className="border-b p-6 text-xs font-medium tracking-widest uppercase md:px-8">
                Items ({order.items?.length ?? 0})
              </p>

              <div className="relative flex flex-col divide-y px-6 md:px-8">
                {order.items?.map((item) => (
                  <div key={item._key} className="flex flex-1 gap-4 py-6">
                    {/* Image */}
                    <div className="bg-border/20 relative flex size-24 items-center justify-center overflow-hidden border shadow-xs">
                      {item.product?.image?.asset?.url ? (
                        <Image
                          src={item.product.image.asset.url}
                          alt={item.product.name ?? "Product"}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <ShoppingBagIcon className="text-muted-foreground size-8" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <Link
                          href={`/pre-made-dresses/${item.product?.slug}`}
                          className="hover:text-primary font-medium"
                        >
                          {item.product?.name ?? "Unknown Product"}
                        </Link>
                        <p className="text-muted-foreground text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1 text-right">
                      <p className="font-medium">
                        {formatPrice(
                          (item.priceAtPurchase ?? 0) * (item.quantity ?? 1),
                        )}
                      </p>
                      {(item.quantity ?? 1) > 1 && (
                        <p className="text-muted-foreground text-sm">
                          {formatPrice(item.priceAtPurchase)} per unit
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="bg-foreground text-background border p-6 shadow-xs md:p-8">
              <p className="text-xs font-medium tracking-widest uppercase">
                Order Summary
              </p>

              <div className="mt-6 flex flex-col">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-sm">Subtotal</p>
                  <p className="text-sm font-medium">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div className="border-border/30 mt-6 flex items-end justify-between border-t pt-6 text-sm">
                  <p className="text-sm">Total</p>
                  <p className="text-lg font-semibold sm:text-xl">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </div>

            {order.address && (
              <div className="bg-card border-border border p-6 shadow-xs md:p-8">
                <div className="flex items-center gap-2">
                  <MapPinnedIcon className="size-4" />
                  <p className="text-xs font-medium tracking-widest uppercase">
                    Shipping Address
                  </p>
                </div>

                <div className="mt-6 flex flex-col">
                  <div className="space-y-2 text-sm">
                    {order.address.name && (
                      <p className="font-medium">{order.address.name}</p>
                    )}
                    {order.address.line1 && <p>{order.address.line1}</p>}
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>
                      {[order.address.city, order.address.postcode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.address.country && <p>{order.address.country}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border-border border p-6 shadow-xs md:p-8">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="size-4" />
                <p className="text-xs font-medium tracking-widest uppercase">
                  Payment
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
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
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
