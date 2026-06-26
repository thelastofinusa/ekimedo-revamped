"use server";

import { AdminInquiryEmail } from "@/components/emails/admin/adminInquiry.email";
import { siteConfig } from "@/config/site.config";
import { EVENT_TYPES_KEYS } from "@/constants/others";
import { getResend } from "@/lib/resend";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function submitInquiryForm(
  formData: ZSchemaType["inquiry"],
  assetRefs: {
    _key: string;
    _type: "asset";
    asset: { _type: "reference"; _ref: string };
  }[],
) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    return {
      success: false,
      message: "You must be logged in to submit an inquiry.",
    };
  }

  const validation = zSchema.inquiry.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.message ?? "Missing or invalid required fields.",
      details: validation.error.flatten(),
    };
  }

  const { fullName, email, phone, eventType, eventDate, budget, dreamDress } =
    validation.data!;

  try {
    // 1. Create inquiry document (no need to upload files again)
    const inquiry = await writeClient.create({
      _type: "inquiry",
      fullName,
      email,
      phone,
      eventType,
      eventDate: eventDate.toISOString().split("T")[0], // YYYY-MM-DD
      budget: budget.toString(),
      dreamDress,
      inspirationPhotos: assetRefs,
      status: "pending",
    });

    // 2. Fetch image URLs for the notification email
    const imageIds = assetRefs.map((ref) => ref.asset._ref);
    const imageUrls: string[] = [];
    if (imageIds.length > 0) {
      const docs = await client.fetch<{ url: string }[]>(
        `*[_id in $ids]{url}`,
        { ids: imageIds },
      );
      imageUrls.push(...docs.map((d) => d.url));
    }

    // 3. Format date for email display
    const eventTypeLabel = EVENT_TYPES_KEYS[eventType] || eventType;
    const eventDateFormatted = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 4. Send email
    const resend = getResend();
    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: siteConfig.supportEmail,
      subject: `New Custom Order Enquiry: ${fullName}`,
      react: AdminInquiryEmail({
        fullName,
        email,
        phone,
        eventType: eventTypeLabel,
        eventDate: eventDateFormatted,
        budget,
        dreamDress,
        inspirationPhotos: imageUrls,
        inquiryId: inquiry._id,
        socialHandles,
      }),
    });

    return {
      success: true,
      resendError: Boolean(error?.message),
      message:
        "Thank you for your custom order inquiry. We will get back to you within 24-48 hours.",
    };
  } catch (error) {
    console.error("Inquiry service error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit inquiry",
    };
  }
}
