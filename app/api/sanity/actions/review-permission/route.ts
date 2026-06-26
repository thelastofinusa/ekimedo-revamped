import { CustomerReviewRequestEmail } from "@/components/emails/customer/customerReviewRequest.email";
import { getResend } from "@/lib/resend";
import { client } from "@/sanity/lib/client";
import { QUERY_REVIEW_PERMISSION_BY_ID } from "@/sanity/queries/permission.query";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { NextRequest, NextResponse } from "next/server";
import {
  enforceRateLimit,
  SecurityError,
  verifySanityActionRequest,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    verifySanityActionRequest(request);
    await enforceRateLimit("sanity-action-review-permission", 30, 60_000);

    const resend = getResend();
    const { actionId } = await request.json();
    if (!actionId)
      return NextResponse.json({ error: "Missing actionId" }, { status: 400 });

    const permitted = await client.fetch(QUERY_REVIEW_PERMISSION_BY_ID, {
      id: actionId,
    });

    if (!permitted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: permitted.customerEmail as string,
      subject: "You're invited to share your testimonial",
      react: CustomerReviewRequestEmail({
        customerName: permitted.customerName as string,
        socialHandles,
      }),
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof SecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error sending review invitation:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
