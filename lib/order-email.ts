import { getResend } from "./resend";

import AdminOrderNotificationEmail from "@/components/emails/adminOrderNotification.email";
import CustomerOrderNotificationEmail from "@/components/emails/customerOrderNotification.email";
import { OrderStatusEmail } from "@/components/emails/orderStatus.email";
import { OrderStatusValue } from "@/constants/status";
import { client } from "@/sanity/lib/client";
import { SOCIAL_QUERY } from "@/sanity/queries/socials";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

/**
 * Send admin notification for a new order
 */
export async function sendAdminOrderEmail({
  orderNumber,
  customerEmail,
  customerName,
  totalAmount,
  items,
  paymentMethod,
  orderId,
  paymentStatus,
}: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: OrderItem[];
  paymentMethod: string;
  orderId: string;
  paymentStatus: string;
}) {
  try {
    const socialHandles = await client.fetch(SOCIAL_QUERY);
    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `New Order: ${orderNumber}`,
      react: AdminOrderNotificationEmail({
        orderId,
        orderNumber,
        customerEmail,
        customerName,
        total: totalAmount,
        paymentMethod,
        paymentStatus,
        items,
        socialHandles,
      }),
    });
    console.log(`Admin email sent for order ${orderNumber}`);
  } catch (error) {
    console.error("Failed to send admin order email:", error);
  }
}

/**
 * Send customer notification for their order
 */
export async function sendCustomerOrderEmail({
  orderNumber,
  customerName,
  totalAmount,
  items,
  ordersUrl,
  orderId,
}: {
  customerName: string;
  orderId: string;
  orderNumber: string;
  ordersUrl: string;
  totalAmount: number;
  items: OrderItem[];
}) {
  try {
    const socialHandles = await client.fetch(SOCIAL_QUERY);
    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `Order #${orderNumber} confirmation`,
      react: CustomerOrderNotificationEmail({
        customerName,
        orderId,
        orderNumber,
        ordersUrl,
        totalAmount,
        items,
        socialHandles,
      }),
    });
    console.log(`Customer email sent for order ${orderNumber}`);
  } catch (error) {
    console.error("Failed to send customer order email:", error);
  }
}

/**
 * Send a plain-text email to the customer about their order status
 */
export async function sendCustomerOrderStatusEmail({
  customerName,
  customerEmail,
  orderNumber,
  status,
  ordersUrl,
  orderId,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: OrderStatusValue;
  ordersUrl: string;
  orderId: string;
}) {
  try {
    const socialHandles = await client.fetch(SOCIAL_QUERY);
    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: customerEmail,
      subject: `Order ${orderNumber} – Status Updated`,
      react: OrderStatusEmail({
        customerName,
        orderNumber,
        status,
        ordersUrl,
        orderId,
        socialHandles,
      }),
    });
    console.log(`Customer status email sent for order ${orderNumber}`);
  } catch (error) {
    console.error("Failed to send customer status email:", error);
  }
}
