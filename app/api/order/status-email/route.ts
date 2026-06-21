import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { sendCustomerOrderStatusEmail } from "@/lib/order-email";
import { ORDER_BY_ID_QUERY } from "@/sanity/queries/orders";
import { siteConfig } from "@/config/site.config";
import { OrderStatusValue } from "@/constants/status";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Fetch order with all needed fields
    const order = await client.fetch(ORDER_BY_ID_QUERY, { id: orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { orderNumber, email, status, address, _id } = order;

    if (!email) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    // Send the email with the new component
    await sendCustomerOrderStatusEmail({
      customerName: address?.name as string,
      customerEmail: email,
      orderNumber: orderNumber as string,
      status: status as OrderStatusValue,
      ordersUrl: `${siteConfig.url}/my-orders/${_id}`,
      orderId: _id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in status email API:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
