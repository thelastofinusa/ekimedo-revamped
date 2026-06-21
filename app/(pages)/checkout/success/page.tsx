import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getOrCreateOrderFromCheckoutSession,
  getOrderByPaymentIntent,
  getOrderBySanityId,
} from "../actions";

import { siteConfig } from "@/config/site.config";
import { SuccessCard } from "../components/success-card";

export const metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Order Confirmed",
    siteName: siteConfig.title,
    description: "Your order has been placed successfully",
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
    title: "Order Confirmed",
    description: "Your order has been placed successfully",
    images: ["/twitter-image.png"],
  },
};

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
    payment_intent?: string;
    payment_intent_client_secret?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const orderId = params.order_id;
  const paymentIntentId = params.payment_intent;

  const { userId } = await auth();
  if (!userId) return redirect("/");

  if (!sessionId && !orderId && !paymentIntentId) return redirect("/");

  let result;

  if (orderId) {
    result = await getOrderBySanityId(orderId, userId);
  } else if (sessionId) {
    result = await getOrCreateOrderFromCheckoutSession(sessionId, userId);
  } else if (paymentIntentId) {
    result = await getOrderByPaymentIntent(paymentIntentId, userId);
  } else {
    return redirect("/");
  }

  if (!result.success || !result.session) return redirect("/");

  return (
    <div className="flex-1 overflow-x-clip">
      <div className="py-24 lg:py-32">
        <SuccessCard session={result.session} />
      </div>
    </div>
  );
}
