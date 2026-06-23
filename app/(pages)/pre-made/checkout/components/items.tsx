"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, Show, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { ChevronRightIcon, XIcon } from "lucide-react";
import { IoShieldHalf } from "react-icons/io5";

import {
  useCartActions,
  useCartItems,
  useTotalItems,
  useTotalPrice,
} from "@/components/providers/cart.provider";
import { useCartStock } from "@/hooks/cart-stock";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/shadcn/alert";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group";
import { Label } from "@/components/shadcn/label";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty";

// Constants & Types
import { PAYMENT_METHODS } from "@/constants/others";
import type { PAYMENT_METHODS_TYPE } from "@/constants/others";

// Import your server action (adjust the path if necessary)
import { createCheckoutSession } from "@/actions/order.action";
import { Route } from "next";

export const CheckoutItems = () => {
  const router = useRouter();
  const pathname = usePathname();

  const items = useCartItems();
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { clearCart } = useCartActions();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "true";

  const [isPending, startTransition] = React.useTransition();
  const [paymentMethod, setPaymentMethod] =
    React.useState<PAYMENT_METHODS_TYPE["id"]>("card");

  async function onSubmit() {
    toast.loading("Processing payment. Please wait..", {
      id: "processing-payment",
    });

    startTransition(async () => {
      try {
        // 1. Create a new FormData instance
        const formData = new FormData();

        // 2. Append standard fields Stringify the complex items array and append it
        const formattedItems = items.map((item) => ({
          itemId: crypto.randomUUID(),
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          image: item.image || null,
        }));
        formData.append("items", JSON.stringify(formattedItems));
        formData.append("paymentMethod", paymentMethod);

        // 3. Call the Server Action
        const result = await createCheckoutSession(formData);
        if (result.success && result.url) {
          router.push(result.url as Route);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "Please try again";
        toast.error("Checkout failed", {
          description: errorMessage,
          duration: Infinity,
          closeButton: true,
        });
      } finally {
        toast.dismiss("processing-payment");
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="py-28 lg:py-36">
        <Container>
          <EmptyState
            type="empty"
            title="Your cart is empty"
            description="Add some items to your cart before checking out."
            action={{
              label: "Continue Shopping",
              path: "/pre-made",
            }}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-28 lg:py-36">
      <Container size="sm" className="flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-muted-foreground hidden items-center text-sm md:flex">
          <Link
            href="/pre-made"
            className="hover:text-foreground transition-colors"
          >
            Pre-Made Dresses
          </Link>
          <ChevronRightIcon className="mx-1 size-4" />
          <span className="text-foreground truncate font-medium">
            Checkout Items
          </span>
        </nav>

        {canceled && (
          <Alert variant="destructive">
            <AlertTitle>Payment cancelled</AlertTitle>
            <AlertDescription>
              You cancelled the previous payment. You can try again below.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Order Items & Payment Options */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* Order Summary Card */}
            <div className="bg-card border shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
                <h2 className="text-foreground font-sans text-xs font-semibold tracking-widest uppercase">
                  Order Items{" "}
                  <span className="text-muted-foreground font-normal ml-1">
                    ({totalItems})
                  </span>
                </h2>
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

              {hasStockIssues && !isLoading && (
                <div className="px-6 py-4 border-b bg-amber-50 dark:bg-amber-500/10">
                  <Alert className="border-none p-0 bg-transparent text-amber-800 dark:text-amber-300">
                    <AlertTitle className="font-semibold mb-1">
                      Stock Issues Detected
                    </AlertTitle>
                    <AlertDescription className="text-sm opacity-90">
                      Some items in your cart exceed our current inventory.
                      Please review them below.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="divide-y">
                {isLoading
                  ? Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} className="flex gap-4 p-6">
                        <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                        <div className="flex flex-1 flex-col justify-between pt-1">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                          <Skeleton className="h-5 w-20" />
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
                          className={cn(
                            "flex gap-4 p-6 transition-colors hover:bg-muted/10",
                            hasIssue && "bg-red-50/50 dark:bg-red-950/20",
                          )}
                        >
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between sm:flex-row sm:gap-4">
                            <div className="flex flex-col gap-1.5">
                              <p className="font-medium text-foreground line-clamp-1">
                                {item.name}
                              </p>

                              {(item.selectedSize || item.selectedColor) && (
                                <p className="text-muted-foreground text-xs font-medium">
                                  {item.selectedSize && (
                                    <span>Size: {item.selectedSize}</span>
                                  )}
                                  {item.selectedSize && item.selectedColor && (
                                    <span className="mx-2 text-border">|</span>
                                  )}
                                  {item.selectedColor && (
                                    <span>Color: {item.selectedColor}</span>
                                  )}
                                </p>
                              )}

                              <p className="text-sm text-muted-foreground mt-1">
                                Qty:{" "}
                                <span className="font-medium text-foreground">
                                  {item.quantity}
                                </span>
                              </p>

                              {/* Error States */}
                              {stockInfo?.isOutOfStock && (
                                <p className="text-xs font-semibold text-destructive mt-1">
                                  Out of stock
                                </p>
                              )}
                              {stockInfo?.exceedsStock &&
                                !stockInfo.isOutOfStock && (
                                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                                    Only {stockInfo.currentStock} available
                                  </p>
                                )}
                            </div>

                            <div className="mt-4 sm:mt-0 text-left sm:text-right flex flex-col justify-between">
                              <p className="font-mono font-medium text-foreground">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatPrice(item.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-card border shadow-xs p-6">
              <h2 className="text-foreground font-sans text-xs font-semibold tracking-widest uppercase mb-4">
                Payment Method
              </h2>

              <RadioGroup
                className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PAYMENT_METHODS_TYPE["id"])
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <Label
                    htmlFor={method.id}
                    key={method.id}
                    className={cn(
                      "border-input has-data-[state=checked]:border-primary text-muted-foreground has-focus-visible:border-ring has-focus-visible:ring-ring relative flex w-full cursor-pointer items-start gap-2 rounded-md border p-5 text-[10px] tracking-widest uppercase shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-2",
                      {
                        "border-destructive": !paymentMethod,
                        "pointer-events-none opacity-50":
                          !method.isAvailable && paymentMethod === method.id,
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
                          {method.label}{" "}
                          {!method.isAvailable && "(Coming soon)"}
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

          {/* Right Column: Order Summary Checkout Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-28">
            <div className="bg-card border shadow-xs p-6 flex flex-col gap-6">
              <h2 className="text-foreground font-sans text-xs font-semibold tracking-widest uppercase">
                Summary
              </h2>

              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between items-center text-base font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="font-mono text-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <ClerkLoading>
                  <Skeleton className="h-12 w-full shadow-sm" />
                </ClerkLoading>

                <ClerkLoaded>
                  <Show when="signed-in">
                    <Button
                      size="lg"
                      className="w-full font-semibold"
                      disabled={
                        hasStockIssues ||
                        isLoading ||
                        items.length === 0 ||
                        isPending
                      }
                      onClick={onSubmit}
                      isLoading={isPending}
                      loadingText="Processing payment.."
                    >
                      <span>Proceed to Payment</span>
                    </Button>
                  </Show>

                  <Show when="signed-out" treatPendingAsSignedOut>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl={pathname}
                      fallbackRedirectUrl={pathname}
                      signUpForceRedirectUrl={pathname}
                      signUpFallbackRedirectUrl={pathname}
                    >
                      <Button size="lg" className="w-full font-semibold">
                        Sign in to Checkout
                      </Button>
                    </SignInButton>
                  </Show>
                </ClerkLoaded>

                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                  <IoShieldHalf className="size-3.5" />
                  <span className="font-medium">
                    Secure & encrypted checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
