import { writeClient, client } from "@/sanity/lib/client";
import { getResend } from "@/lib/resend";

import CustomerEnquiryNotificationEmail from "@/components/emails/customerEnquiryNotification.email";
import { SOCIAL_QUERY } from "@/sanity/queries/socials";
import AdminEnquiryNotificationEmail from "@/components/emails/adminEnquiryNotofication.email";
import { randomUUID } from "crypto";
import { zSchema } from "@/lib/validators";

const EVENT_TYPES: Record<string, string> = {
  wedding: "Wedding",
  prom: "Prom",
  reception: "Reception",
  "special-occasion": "Special Occasion",
};

export async function createInquiryService(formData: FormData) {
  try {
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

    const result = zSchema.inquiry.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        details: result.error.flatten(),
      };
    }

    const { fullName, email, phone, eventType, eventDate, budget, dreamDress } =
      result.data;
    const inspirationPhotos = formData.getAll("inspirationPhotos") as File[];

    // 1. Start parallel tasks: Upload images and fetch social handles
    const socialHandlesPromise = client.fetch(SOCIAL_QUERY);

    const uploadedAssets: string[] = [];
    const imageUploadPromises = inspirationPhotos
      .filter((file) => file.size > 0 && file instanceof File)
      .map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const asset = await writeClient.assets.upload("image", buffer, {
          filename: file.name,
        });
        uploadedAssets.push(asset.url);
        return asset._id;
      });

    // Wait for social handles and image uploads
    const [socialHandles, imageAssetIds] = await Promise.all([
      socialHandlesPromise,
      Promise.all(imageUploadPromises),
    ]);

    let inquiry;
    // 3. Create inquiry document
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
        inspirationPhotos: imageAssetIds.map((id) => ({
          _key: randomUUID(),
          _type: "image",
          asset: {
            _type: "reference",
            _ref: id,
          },
        })),
        status: "new",
      });
    } catch (sanityError) {
      console.error(sanityError);

      return {
        success: false,
        error:
          sanityError instanceof Error
            ? sanityError.message
            : "Failed to save inquiry",
      };
    }

    const inquiryId = inquiry._id;

    // 5. Format date for email display
    const eventTypeLabel = EVENT_TYPES[eventType] || eventType;
    const eventDateFormatted = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 6. Send admin email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `New Custom Order Enquiry: ${fullName}`,
      react: AdminEnquiryNotificationEmail({
        fullName,
        email,
        phone,
        eventType: eventTypeLabel,
        eventDate: eventDateFormatted,
        budget,
        dreamDress,
        inspirationPhotos: uploadedAssets.map((asset) => asset),
        inquiryId,
        socialHandles,
      }),
    });

    // 7. Send customer email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Your custom order enquiry has been received`,
      react: CustomerEnquiryNotificationEmail({
        fullName,
        eventType: eventTypeLabel,
        socialHandles,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Inquiry service error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit inquiry",
    };
  }
}
