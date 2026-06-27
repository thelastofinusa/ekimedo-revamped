import Stripe from "stripe";
import { assertValue } from "./utils";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = assertValue(
      process.env.STRIPE_SECRET_KEY,
      "STRIPE_SECRET_KEY environment variable is not set",
    );
    stripeInstance = new Stripe(key, {
      // @ts-expect-error - Type '"2026-06-24.dahlia"' is not assignable to type '"2026-05-27.dahlia"'
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return stripeInstance;
}
