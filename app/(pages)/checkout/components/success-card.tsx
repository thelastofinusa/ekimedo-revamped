"use client";
import React from "react";
import confetti from "canvas-confetti";
import Image from "next/image"; // ← import Image

import { Container } from "@/components/shared/container";
import { useCartActions } from "@/components/providers/cart.provider";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { getOrderStatus } from "@/constants/status";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CheckCheckIcon } from "lucide-react";
import { VscPackage } from "react-icons/vsc";

interface Props {
  session: {
    id: string | undefined;
    customerEmail?: string | null;
    customerName?: string | null;
    amountTotal?: number | null;
    paymentStatus:
      | "paid"
      | "cancelled"
      | "delivered"
      | "pending"
      | "shipped"
      | null
      | undefined
      | string;
    shippingAddress?: {
      name?: string | null;
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
    lineItems?: {
      name?: string | null;
      quantity?: number | null;
      amount: number;
      imageUrl?: string | null; // ← added
    }[];
  };
}

export const SuccessCard: React.FC<Props> = ({ session }) => {
  const { clearCart } = useCartActions();

  React.useEffect(() => {
    if (session.paymentStatus === "paid") {
      clearCart();
    }
  }, [clearCart, session.paymentStatus]);

  const address = session.shippingAddress;
  const status = getOrderStatus(session.paymentStatus);

  // Confetti effect (unchanged)
  React.useEffect(() => {
    const duration = 10 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  return (
    <div className="py-8 md:py-12">
      <Container size="xs" className="max-w-3xl">
        <div className="bg-card overflow-hidden border shadow-xs">
          {/* Success Header */}
          <div className="to-background border-b bg-linear-to-b from-green-50 px-8 py-10 dark:from-green-950/30">
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <CheckCheckIcon className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold">Order Confirmed</h1>

              <p className="text-muted-foreground mt-2">
                Thank you for your purchase.
              </p>

              <p className="mt-1 text-sm">
                Confirmation sent to{" "}
                <span className="font-medium">{session.customerEmail}</span>
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="p-6 md:p-8">
            <h2 className="mb-5 font-sans text-sm font-semibold tracking-wider uppercase">
              Items Ordered
            </h2>

            <div className="space-y-3">
              {session.lineItems?.map((item) => (
                <div
                  key={`${item.name}-${item.quantity}`}
                  className="flex items-center gap-4 border p-4"
                >
                  <div className="bg-muted relative h-16 w-16 overflow-hidden">
                    {item.imageUrl && (
                      <Image
                        fill
                        src={item.imageUrl}
                        alt={item.name || ""}
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatPrice(item.amount / 100)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-muted/50 mt-6 p-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Total</span>

                <span className="text-lg font-bold">
                  {formatPrice((session.amountTotal ?? 0) / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-6 border-t p-6 md:grid-cols-2 md:p-8">
            {address && (
              <div>
                <h3 className="mb-3 font-sans text-sm font-semibold tracking-wider uppercase">
                  Shipping Address
                </h3>

                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>{session.customerName}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {[address.city, address.state, address.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{address.country}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 font-sans text-sm font-semibold tracking-wider uppercase">
                Payment Status
              </h3>

              <Badge
                className={cn("rounded-full px-3 py-1.5", status.className)}
              >
                <status.icon
                  className={cn(
                    "mr-1 h-3.5 w-3.5",
                    status.value === "pending" && "animate-spin",
                  )}
                />
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
