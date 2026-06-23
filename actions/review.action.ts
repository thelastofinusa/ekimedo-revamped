"use server";
import { getResend } from "@/lib/resend";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { zSchema } from "@/lib/zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { AdminReviewEmail } from "@/components/emails/admin/adminReview.email";

/**
 * Server action to submit a review
 * @param formData - The review form data
 */
export async function submitReviewForm(formData: FormData) {
  // Authenticate user
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const resend = getResend();

  const review = formData.get("review") as string;
  const rating = formData.get("rating") as string;
  const serviceRaw = formData.get("service") as string;
  const customField = formData.get("customField") as string | null;
  const workAssets = formData.getAll("workAssets") as File[];

  const service = serviceRaw === "custom" ? customField?.trim() : serviceRaw;

  // Validate form data
  const validationResult = zSchema.review.safeParse({
    review,
    rating,
    service,
    workAssets,
    customField,
  });
  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.message ?? "Missing or invalid required fields.",
      details: validationResult.error.flatten(),
    };
  }

  try {
    const uploadedAssets = [];
    const uploadedAssetUrls: string[] = [];

    if (workAssets && workAssets.length > 0) {
      for (const image of workAssets) {
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

    // at the top, add a fetch
    let avatarAsset = null;

    if (user.imageUrl) {
      try {
        const response = await fetch(user.imageUrl);
        if (!response.ok) throw new Error("Failed to fetch avatar");
        const arrayBuffer = await response.arrayBuffer();
        avatarAsset = await writeClient.assets.upload(
          "image",
          Buffer.from(arrayBuffer),
          {
            filename: `avatar-${user.id}.jpg`,
          },
        );
      } catch (err) {
        console.warn("Failed to upload Clerk avatar, skipping.", err);
      }
    }

    const clientName = user.fullName || user.firstName || "Anonymous Client";

    const updatedReview = await writeClient.create({
      _type: "testimonial",
      status: "pending",
      name: clientName,
      review,
      rating,
      date: new Date().toISOString(),
      service,
      avatar: avatarAsset
        ? {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: avatarAsset._id,
            },
          }
        : undefined,
      workAssets: uploadedAssets.length > 0 ? uploadedAssets : undefined,
    });
    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `New review received from ${updatedReview.name}`,
      react: AdminReviewEmail({
        fullName: updatedReview.name,
        service: updatedReview.service as string,
        rating: Number(updatedReview.rating),
        testimonialId: updatedReview._id,
        review: updatedReview.review,
        images: uploadedAssetUrls,
        socialHandles: socialHandles,
      }),
    });

    return {
      success: true,
      resendError: Boolean(error?.message),
      message: "Your review was submitted and is awaiting approval",
    };
  } catch (error) {
    console.error("Submission error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit testimonial.",
    };
  }
}
