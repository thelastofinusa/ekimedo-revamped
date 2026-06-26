import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { QUERY_ORDER_BY_ID } from "@/sanity/queries/orders.query";
import { siteConfig } from "@/config/site.config";
import { OrderStatusValue } from "@/constants/order";
import { getResend } from "@/lib/resend";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { CustomerOrderStatusEmail } from "@/components/emails/customer/customerOrderStatus.email";
import {
  enforceRateLimit,
  SecurityError,
  verifySanityActionRequest,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    verifySanityActionRequest(request);
    await enforceRateLimit("sanity-action-order-status", 30, 60_000);

    const resend = getResend();
    const { actionId } = await request.json();
    if (!actionId)
      return NextResponse.json({ error: "Missing actionId" }, { status: 400 });

    // Fetch order with all needed fields
    const order = await client.fetch(QUERY_ORDER_BY_ID, { id: actionId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { orderNumber, email, status, address, _id } = order;

    if (!email) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Order ${orderNumber} - Status Updated`,
      react: CustomerOrderStatusEmail({
        customerName: address?.name as string,
        orderNumber: orderNumber as string,
        status: status as OrderStatusValue,
        ordersUrl: `${siteConfig.url}/orders/${_id}`,
        orderId: _id,
        socialHandles,
      }),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error performing action:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
