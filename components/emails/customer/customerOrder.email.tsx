import { EmailLayout } from "@/components/shared/emailLayout";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Button, Hr, Img, Link, Section, Text } from "@react-email/components";

export const CustomerOrderEmail = (props: {
  customerName: string;
  orderId: string;
  orderNumber: string;
  ordersUrl: string;
  totalAmount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  return (
    <EmailLayout
      preview={`Order #${props.orderNumber} confirmation`}
      title="Order Confirmation"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        Hello <strong>{props.customerName}</strong>,
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Thank you for your order. We&apos;re pleased to confirm that we have
        received your purchase{" "}
        <Link
          href={`${props.ordersUrl}/${props.orderId}`}
          className="text-primary underline"
        >
          #{props.orderNumber}
        </Link>{" "}
        and are currently processing it.
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 font-medium text-[#3c4043]">
        Items in your order
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
                    className="bg-secondary shadow-xs object-cover"
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

      <Text className="text-right text-sm font-medium text-[#3c4043]">
        Order Total: <strong>${props.totalAmount}</strong>
      </Text>

      <Hr className="my-6" />

      <Button
        href={props.ordersUrl}
        className="bg-primary mt-4 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        See Your Orders
      </Button>

      <Text className="mt-6 text-sm leading-6 whitespace-pre-wrap text-[#3c4043]">
        If the button above does not open automatically,{" "}
        <Link href={props.ordersUrl} className="text-primary underline">
          click here
        </Link>{" "}
        or copy and paste the following URL into your browser:
      </Text>

      <Link
        href={props.ordersUrl}
        className="mt-6 text-sm leading-6 break-all text-primary underline"
      >
        {props.ordersUrl}
      </Link>
    </EmailLayout>
  );
};
