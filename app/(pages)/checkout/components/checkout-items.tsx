"use client";
import React from "react";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  useCartActions,
  useCartItems,
  useTotalItems,
  useTotalPrice,
} from "@/components/providers/cart.provider";
import { useCartStock } from "@/hooks/cart-stock";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { preferredPaymentMethod } from "@/constants/consultation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BsInbox } from "react-icons/bs";
import { ChevronLeftIcon, XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const CheckoutItems = () => {
  const { userId } = useAuth();
  const isSignedIn = !!userId;
  const items = useCartItems();
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { clearCart } = useCartActions();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    React.useState<(typeof preferredPaymentMethod)[number]["id"]>("stripe");

  const handleCheckout = () => {
    if (!isSignedIn) return;

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items, paymentMethod }),
        });

        const result = await response.json();

        if (response.ok && result.success && result.url) {
          window.location.href = result.url;
        } else {
          setError(result.error ?? "Checkout failed");
          toast.error("Checkout Error", {
            description: result.error ?? "Something went wrong",
          });
        }
      } catch (err) {
        console.error("Checkout error:", err);
        setError("Something went wrong. Please try again.");
        toast.error("An error occured", {
          description:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    });
  };

  // Inside the component, after useSearchParams
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "true";

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BsInbox />
          </EmptyMedia>
          <EmptyTitle>Your cart is empty</EmptyTitle>
          <EmptyDescription>
            Add some items to your cart before checking out.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href="/pre-made-dresses"
            className={buttonVariants({ size: "lg" })}
          >
            Continue Shopping
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {canceled && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Payment cancelled</AlertTitle>
          <AlertDescription>
            You cancelled the PayPal payment. You can try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 lg:mb-8">
        <Link
          href="/pre-made-dresses"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="mt-4 text-3xl font-medium text-zinc-900 dark:text-zinc-100">
          Proceed to Checkout
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="bg-card h-max w-full border shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b p-6">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide uppercase">
              <span>Order Summary</span>{" "}
              <span className="mb-px">[{totalItems} items]</span>
            </p>

            <Button
              size="sm"
              variant="outline"
              onClick={clearCart}
              className="hidden md:inline-flex"
            >
              Clear Items
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={clearCart}
              className="md:hidden"
            >
              <XIcon />
              <span className="sr-only">Clear Items</span>
            </Button>
          </div>

          {/* Stock Issues Warning */}
          {hasStockIssues && !isLoading && (
            <Alert className="border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <AlertTitle>Stock Issues</AlertTitle>
              <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                Some items have stock issues. Please review before checkout.
              </AlertDescription>
            </Alert>
          )}

          {/* Items List */}
          <div className="divide-border/50 divide-y">
            {isLoading
              ? Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="flex gap-4 p-6 md:p-8 xl:p-12">
                    <Skeleton className="h-20 w-20 shrink-0" />

                    <div className="flex flex-1 flex-col justify-between pt-2">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="mt-1 h-4 w-10" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))
              : items.map((item) => {
                  const stockInfo = stockMap.get(item.productId);
                  const hasIssue =
                    stockInfo?.isOutOfStock || stockInfo?.exceedsStock;

                  return (
                    <div
                      key={item.itemId}
                      className={cn("flex gap-4 p-6", hasIssue && "bg-red-50")}
                    >
                      {/* Image */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </p>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-muted-foreground text-xs">
                              {item.selectedSize && (
                                <span>Size: {item.selectedSize}</span>
                              )}
                              {item.selectedSize && item.selectedColor && (
                                <span className="mx-1">|</span>
                              )}
                              {item.selectedColor && (
                                <span>Color: {item.selectedColor}</span>
                              )}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Qty: {item.quantity}
                          </p>
                          {stockInfo?.isOutOfStock && (
                            <p className="mt-1 text-sm font-medium text-red-600">
                              Out of stock
                            </p>
                          )}
                          {stockInfo?.exceedsStock &&
                            !stockInfo.isOutOfStock && (
                              <p className="mt-1 text-sm font-medium text-amber-600">
                                Only {stockInfo.currentStock} available
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-zinc-500">
                            <span className="font-mono">
                              {formatPrice(item.price)}
                            </span>{" "}
                            each
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Payment Method Selection */}
          <div className="border-t p-6 md:p-8 xl:p-12">
            <p className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold tracking-wide uppercase">
              Select Payment Method
            </p>

            <div className="grid gap-1">
              <RadioGroup
                className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value)}
              >
                {preferredPaymentMethod.map((method) => (
                  <Label
                    htmlFor={method.id}
                    key={method.id}
                    className={cn(
                      "border-input has-data-[state=checked]:border-primary text-muted-foreground has-focus-visible:border-ring has-focus-visible:ring-ring relative flex w-full cursor-pointer items-start gap-2 rounded-md border p-5 text-[10px] tracking-widest uppercase shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-2",
                      {
                        "border-destructive": !paymentMethod,
                        "pointer-events-none opacity-50": method.disabled,
                      },
                    )}
                  >
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="sr-only"
                    />
                    <div className="text-foreground flex flex-col items-start gap-2">
                      <div className="flex w-full items-center gap-2">
                        <method.icon className="size-4" />
                        <span className="text-[11px]">
                          {method.label} {method.disabled && "(Coming soon)"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="bg-card h-max w-full border p-6 shadow-xs md:p-8 lg:sticky lg:top-26 xl:top-32">
          <p className="text-[13px] font-semibold tracking-wide uppercase">
            Payment Summary
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                Calculated at checkout
              </span>
            </div>
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-2">
              {isSignedIn ? (
                <Button
                  size="lg"
                  isLoading={isPending}
                  loadingText="Processing..."
                  onClick={handleCheckout}
                  disabled={hasStockIssues || isLoading || items.length === 0}
                >
                  <span>Proceed to Payment</span>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button size="lg" className="w-full">
                    <span>Sign in to proceed</span>
                  </Button>
                </SignInButton>
              )}
              {error && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
