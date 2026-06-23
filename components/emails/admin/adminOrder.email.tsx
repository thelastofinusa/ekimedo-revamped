import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Button, Hr, Img, Link, Section, Text } from "@react-email/components";

export const AdminOrderEmail = (props: {
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
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  const orderUrl = `${siteConfig.url}/admin/structure/productsOrders;order;${props.orderId}`;

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
                    className="object-cover shadow-xs bg-secondary"
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

      <Button
        href={orderUrl}
        className="bg-primary mt-4 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        View Order Details
      </Button>

      <Text className="mt-6 text-sm leading-6 whitespace-pre-wrap text-[#3c4043]">
        If the button above does not open automatically,{" "}
        <Link href={orderUrl} className="text-primary underline">
          click here
        </Link>{" "}
        or copy and paste the following URL into your browser:
      </Text>

      <Link
        href={orderUrl}
        className="mt-6 text-sm leading-6 break-all text-primary underline"
      >
        {orderUrl}
      </Link>
    </EmailLayout>
  );
};
