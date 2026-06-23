import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/shadcn/button";
import { XCircle, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { SlHandbag } from "react-icons/sl";

export default function OrderCheckoutCancel() {
  return (
    <div className="min-h-[70vh] py-28 lg:py-36">
      <Container size="sm" className="flex flex-col items-center gap-8">
        <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm md:p-12">
          {/* Cancel Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-12 w-12" />
            </div>
          </div>

          <h1 className="mb-2 text-center font-serif text-3xl font-bold md:text-4xl">
            Payment Cancelled
          </h1>
          <p className="text-center text-muted-foreground">
            Your payment was not completed. No charges have been made to your
            account.
          </p>

          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              Your cart items are still saved. You can try again or continue
              shopping.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/pre-made/checkout"
              className={buttonVariants({
                className: "w-full sm:w-auto",
                size: "lg",
                variant: "outline",
              })}
            >
              <ChevronLeftIcon />
              <span>Return to Checkout</span>
            </Link>

            <Link
              href="/pre-made"
              className={buttonVariants({
                className: "w-full sm:w-auto",
                size: "lg",
              })}
            >
              <SlHandbag />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        <p className="max-w-md text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact-us" className="underline underline-offset-2">
            Contact our support team
          </Link>
        </p>
      </Container>
    </div>
  );
}
