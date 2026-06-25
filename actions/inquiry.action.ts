"use server";

import { AdminInquiryEmail } from "@/components/emails/admin/adminInquiry.email";
import { siteConfig } from "@/config/site.config";
import { EVENT_TYPES_KEYS } from "@/constants/others";
import { getResend } from "@/lib/resend";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { del } from "@vercel/blob";
import { randomUUID } from "crypto";

export async function submitInquiryForm(
  formData: ZSchemaType["inquiry"],
  blobUrls: string[],
) {
  const resend = getResend();

  const validation = zSchema.inquiry.safeParse(formData);
  if (!validation.success && blobUrls.length <= 0) {
    return {
      success: false,
      message: "Invalid form data",
      details: validation.error.flatten(),
    };
  }

  const { fullName, email, phone, eventType, eventDate, budget, dreamDress } =
    validation.data!;

  try {
    const uploadedAssets: {
      _key: string;
      _type: string;
      asset: {
        _type: string;
        _ref: string;
      };
    }[] = [];
    const uploadedAssetsUrls: string[] = [];

    // 1. Download files from Blob and upload to Sanity
    if (blobUrls && blobUrls.length > 0) {
      await Promise.all(
        blobUrls.map(async (blobUrl) => {
          // Fetch the file from Blob
          const response = await fetch(blobUrl);
          const buffer = await response.arrayBuffer();

          // Upload to Sanity
          const sanityAsset = await writeClient.assets.upload(
            "image",
            Buffer.from(buffer),
            {
              filename: blobUrl.split("/").pop(),
            },
          );

          uploadedAssets.push({
            _key: randomUUID(),
            _type: "asset",
            asset: {
              _type: "reference",
              _ref: sanityAsset._id,
            },
          });
          uploadedAssetsUrls.push(sanityAsset.url);
        }),
      );
    }

    // 2.  Create inquiry document in Sanity
    const inquiry = await writeClient.create({
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

    // 3. Delete files from Vercel Blob if inquiry has been created
    if (inquiry._id) {
      await Promise.all(blobUrls.map((url) => del(url)));
    }

    // 4. Format date for email display
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
        inspirationPhotos: uploadedAssetsUrls,
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
