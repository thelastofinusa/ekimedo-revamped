import { CustomerInquiryEmail } from "@/components/emails/customer/customerInquiry.email";
import { EVENT_TYPES_KEYS } from "@/constants/others";
import { getResend } from "@/lib/resend";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_INQUIRY_BY_ID } from "@/sanity/queries/inquiry.query";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const resend = getResend();
    const { actionId } = await request.json();
    if (!actionId)
      return NextResponse.json({ error: "Missing actionId" }, { status: 400 });

    const inquiry = await client.fetch(QUERY_INQUIRY_BY_ID, { id: actionId });

    if (!inquiry)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const eventTypeLabel =
      EVENT_TYPES_KEYS[inquiry.eventType as string] ||
      (inquiry.eventType as string);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: inquiry.email as string,
      subject: `Your custom order enquiry has been received`,
      react: CustomerInquiryEmail({
        fullName: inquiry.fullName as string,
        eventType: eventTypeLabel,
        socialHandles,
      }),
    });

    if (error) throw error;

    await writeClient.patch(actionId).set({ status: "confirmed" }).commit();

    return NextResponse.json({
      success: true,
      status: "confirmed",
    });
  } catch (error) {
    console.error("Error performing action:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
