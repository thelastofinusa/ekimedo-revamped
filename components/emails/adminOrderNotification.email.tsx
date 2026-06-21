import { siteConfig } from "@/config/site.config";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr, Section, Img } from "@react-email/components";
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
    imageUrl?: string;
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
      socialHandles={props.socialHandles}
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

      <Hr className="my-6" />

      <Text className="mt-6 text-sm leading-6 font-medium text-[#3c4043]">
        Order Summary
      </Text>

      {props.items.map((item, index) => (
        <Section key={index} className="mt-4">
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            role="presentation"
          >
            <tbody>
              <tr>
                <td width="82" valign="top">
                  <Img
                    src={item.imageUrl}
                    alt={item.name}
                    width="70"
                    height="60"
                    className="rounded-md object-cover"
                  />
                </td>

                <td valign="top">
                  <Text className="m-0 text-sm font-medium text-[#3c4043]">
                    {item.name}
                  </Text>

                  <Text className="m-0 text-xs text-[#6b7280]">
                    Price: <strong>${item.price}</strong>
                  </Text>

                  <Text className="m-0 mt-2 text-xs text-[#6b7280]">
                    Quantity: <strong>{item.quantity}</strong> ={" "}
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      ))}

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
