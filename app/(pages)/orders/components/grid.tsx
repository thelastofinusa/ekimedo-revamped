import { Badge } from "@/components/shadcn/badge";
import { Container } from "@/components/shared/container";
import { getOrderStatus } from "@/constants/order";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { QUERY_ORDERS_BY_USER_RESULT } from "@/sanity.types";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SlHandbag } from "react-icons/sl";

// Helper to extract the first image URL from a snapshots array
function getFirstImageUrl(
  itemImages?: Array<{
    _type: "image" | "file";
    url: string | null;
  } | null> | null,
): string {
  if (!itemImages) return "";
  const firstImage = itemImages
    .filter(
      (s): s is { _type: "image" | "file"; url: string | null } => s !== null,
    )
    .find((s) => s._type === "image" && s.url !== null);
  return firstImage?.url ?? "";
}

export const OrdersGrid: React.FC<{ orders: QUERY_ORDERS_BY_USER_RESULT }> = ({
  orders,
}) => {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          {orders.map((order) => {
            const status = getOrderStatus(order.status);
            const firstImageUrl = getFirstImageUrl(order.itemImages);
            const totalItems = order.itemCount ?? 0;
            const extraCount = Math.max(totalItems - 1, 0);

            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="bg-card group border-border block h-auto space-y-5 overflow-hidden rounded-md border p-6 shadow-xs md:p-8"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="bg-border/20 relative flex size-24 items-center justify-center overflow-hidden border shadow-xs">
                    {firstImageUrl === "" ? (
                      <SlHandbag className="text-muted-foreground size-8" />
                    ) : (
                      <React.Fragment>
                        <Image
                          src={firstImageUrl}
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
                    {order.itemNames?.slice(0, 2).filter(Boolean).join(", ")}
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
      </Container>
    </div>
  );
};
