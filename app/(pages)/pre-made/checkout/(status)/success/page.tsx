import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/shadcn/button";
import { QUERY_ORDER_BY_STRIPE_SESSION_ID_RESULT } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { QUERY_ORDER_BY_STRIPE_SESSION_ID } from "@/sanity/queries/orders.query";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SlHandbag } from "react-icons/sl";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { siteConfig } from "@/config/site.config";
import { ClearCartOnSuccess } from "./clear-cart";

export default async function OrderCheckoutSuccess(
  props: PageProps<"/pre-made/checkout/success">,
) {
  const params = await props.searchParams;
  const sessionId = params.session_id;

  if (!sessionId) redirect("/pre-made/checkout");

  let order: QUERY_ORDER_BY_STRIPE_SESSION_ID_RESULT = null;
  let orderExists = false;
  try {
    order = await client.fetch(QUERY_ORDER_BY_STRIPE_SESSION_ID, { sessionId });
    orderExists = !!order;
  } catch {
    // order may not be created yet
  }

  const showEmailWarning =
    order && order.emailSent && order.emailSent.admin === false;

  // Check if user is authenticated (to show orders link)
  const { userId } = await auth();

  return (
    <>
      <ClearCartOnSuccess sessionId={sessionId} orderExists={orderExists} />
      <div className="min-h-[70vh] py-28 lg:py-36">
        <Container size="sm" className="flex flex-col items-center gap-8">
          {/* Success Card */}
          <div className="w-full max-w-2xl border border-border bg-card p-8 shadow-sm md:p-12">
            {/* Animated Checkmark */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-12 w-12 animate-pulse" />
              </div>
            </div>

            <h1 className="mb-2 text-center font-serif text-3xl font-bold md:text-4xl">
              Payment Successful!
            </h1>
            <p className="text-center text-muted-foreground">
              Your order has been placed and is being processed.
            </p>

            {order && (
              <div className="mt-4 text-center">
                <Badge>Order #{order.orderNumber}</Badge>
              </div>
            )}

            {/* Email Warning Banner */}
            {showEmailWarning && (
              <Alert variant="warning" className="mt-6">
                <AlertTitle>Confirmation email not sent</AlertTitle>
                <AlertDescription>
                  <span>
                    We couldn&apos;t send a confirmation email to the admin.
                    Please contact us directly to confirm your order at{" "}
                    <strong className="font-medium">
                      {siteConfig.supportEmail}
                    </strong>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Processing state (order not yet created) */}
            {!order && (
              <div className="mt-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-muted-foreground">
                  Your order is being processed. You will receive a confirmation
                  email shortly.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {userId && order && (
                <Link
                  href="/orders"
                  className={buttonVariants({
                    className: "w-full sm:w-auto",
                    size: "lg",
                    variant: "outline",
                  })}
                >
                  <SlHandbag />
                  <span>View My Orders</span>
                </Link>
              )}
              <Link
                href="/pre-made"
                className={buttonVariants({
                  className: "w-full sm:w-auto",
                  size: "lg",
                })}
              >
                <span>Continue Shopping</span>
                <ChevronRightIcon />
              </Link>
            </div>
          </div>

          {/* Additional Help Text */}
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/contact-us" className="underline underline-offset-2">
              Contact our support team
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
