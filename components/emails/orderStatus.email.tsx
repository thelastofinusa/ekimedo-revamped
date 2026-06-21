import { siteConfig } from "@/config/site.config";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link } from "@react-email/components";
import { OrderStatusValue } from "@/constants/status";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";

interface OrderStatusEmailProps {
  customerName: string;
  orderNumber: string;
  status: OrderStatusValue;
  ordersUrl: string;
  orderId: string;
  socialHandles?: SOCIAL_QUERY_RESULT;
}

const STATUS_CONTENT = {
  pending: {
    title: "Payment Unsuccessful",
    preview: "There was an issue processing your payment",
    message:
      "We were unable to successfully process payment for your order. No charges have been confirmed at this time. If you believe this was an error, please try placing your order again or contact us for assistance.",
  },

  paid: {
    title: "Order Confirmed",
    preview: "Your payment was successful",
    message:
      "We've successfully received your payment and your order is now being processed. We'll notify you again as soon as your order is prepared for shipment.",
  },

  shipped: {
    title: "Order Shipped",
    preview: "Your order is on its way",
    message:
      "Good news — your order has been shipped and is currently on its way to you. Depending on your location, delivery times may vary.",
  },

  delivered: {
    title: "Order Delivered",
    preview: "Your order has been delivered",
    message:
      "Your order has been marked as delivered. We hope everything arrived safely and that you're happy with your purchase.",
  },

  cancelled: {
    title: "Order Cancelled",
    preview: "Your order has been cancelled",
    message:
      "Your order has been cancelled and will not be processed further. If this was unexpected, please contact us and we'll be happy to assist.",
  },
} as const;

export const OrderStatusEmail = ({
  customerName,
  orderNumber,
  status,
  ordersUrl,
  orderId,
  socialHandles,
}: OrderStatusEmailProps) => {
  const content = STATUS_CONTENT[status];

  return (
    <EmailLayout
      preview={content.preview}
      title={content.title}
      socialHandles={socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        Hello <strong>{customerName}</strong>,
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        This is an update regarding your order{" "}
        <Link
          href={`${ordersUrl}/${orderId}`}
          className="text-primary underline"
        >
          #{orderNumber}
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        {content.message}
      </Text>

      <Text className="mt-8 text-sm leading-6 text-[#3c4043]">
        Best regards,
        <br />
        {siteConfig.author.fName} {siteConfig.author.lName}
      </Text>
    </EmailLayout>
  );
};
