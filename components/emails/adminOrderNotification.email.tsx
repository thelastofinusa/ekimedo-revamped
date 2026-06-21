import { siteConfig } from "@/config/site.config";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr } from "@react-email/components";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";

interface AdminOrderNotificationEmailProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  socialHandles?: SOCIAL_QUERY_RESULT;
}

export const AdminOrderNotificationEmail = (
  props: AdminOrderNotificationEmailProps,
) => {
  const orderUrl = `${siteConfig.url}/studio/structure/order;${props.orderId}`;

  return (
    <EmailLayout
      preview={`New order received — #${props.orderNumber}`}
      title="New Order Received"
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new order has been placed through your website.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Order <strong>#{props.orderNumber}</strong> was placed by{" "}
        <strong>{props.customerName}</strong>{" "}
        <Link
          href={`mailto:${props.customerEmail}`}
          className="text-primary underline"
        >
          {props.customerEmail}
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        The order total is <strong>${props.total}</strong> and was paid using{" "}
        <strong>{props.paymentMethod}</strong>. Current payment status:{" "}
        <strong>{props.paymentStatus}</strong>.
      </Text>

      <Text className="mt-6 text-sm leading-6 font-medium text-[#3c4043]">
        Order Summary
      </Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-sm leading-6 whitespace-pre-wrap text-[#6b7280]">
        {props.items

          .map(
            (item) =>
              `${item.quantity} × ${item.name} — $${item.price.toFixed(2)}`,
          )

          .join("\n")}
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 text-[#3c4043]">
        To review the complete order details, shipping information, and
        fulfillment status,{" "}
        <Link href={orderUrl} className="text-primary underline">
          click here
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        If the link above does not open automatically, copy and paste the
        following URL into your browser:
      </Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-xs leading-6 break-all text-[#6b7280]">
        {orderUrl}
      </Text>
    </EmailLayout>
  );
};

export default AdminOrderNotificationEmail;
