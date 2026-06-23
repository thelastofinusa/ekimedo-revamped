"use server";
import { randomUUID } from "crypto";
import { zSchema } from "@/lib/zod";
import { getResend } from "@/lib/resend";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { EVENT_TYPES_KEYS } from "@/constants/others";
import { AdminInquiryEmail } from "@/components/emails/admin/adminInquiry.email";

/**
 * Server action to submit a review
 * @param formData - The review form data
 */
export async function submitInquiryForm(formData: FormData) {
  const resend = getResend();
  // Convert FormData to object for Zod validation
  const rawData: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "inspirationPhotos") {
      if (key === "eventDate" && typeof value === "string") {
        // Parse the date string properly
        const date = new Date(value);
        rawData[key] = !isNaN(date.getTime()) ? date : value;
      } else {
        rawData[key] = value;
      }
    }
    if (key === "budget") {
      rawData[key] = Number(value);
    }
  }
  rawData.inspirationPhotos = formData.getAll("inspirationPhotos") as File[];

  const validationResult = zSchema.inquiry.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.message ?? "Missing or invalid required fields.",
      details: validationResult.error.flatten(),
    };
  }

  const { fullName, email, phone, eventType, eventDate, budget, dreamDress } =
    validationResult.data;
  const inspirationPhotos = formData.getAll("inspirationPhotos") as File[];

  try {
    const uploadedAssets = [];
    const uploadedAssetUrls: string[] = [];

    if (inspirationPhotos && inspirationPhotos.length > 0) {
      for (const image of inspirationPhotos) {
        if (image.size > 0) {
          const arrayBuffer = await image.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const asset = await writeClient.assets.upload("image", buffer, {
            filename: image.name,
          });

          uploadedAssets.push({
            _key: randomUUID(),
            _type: "asset",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          });

          uploadedAssetUrls.push(asset.url);
        }
      }
    }

    let inquiry;
    try {
      inquiry = await writeClient.create({
        _type: "inquiry",
        fullName,
        email,
        phone,
        eventType,
        eventDate: eventDate.toISOString().split("T")[0], // YYYY-MM-DD
        budget: budget.toString(),
        dreamDress,
        inspirationPhotos: uploadedAssets,
        status: "pending",
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to submit inquiry",
      };
    }

    const inquiryId = inquiry._id;

    // 5. Format date for email display
    const eventTypeLabel = EVENT_TYPES_KEYS[eventType] || eventType;
    const eventDateFormatted = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `New Custom Order Enquiry: ${fullName}`,
      react: AdminInquiryEmail({
        fullName,
        email,
        phone,
        eventType: eventTypeLabel,
        eventDate: eventDateFormatted,
        budget,
        dreamDress,
        inspirationPhotos: uploadedAssetUrls,
        inquiryId,
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
