"use server";

import { AdminReviewEmail } from "@/components/emails/admin/adminReview.email";
import { getResend } from "@/lib/resend";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function submitReviewForm(
  formData: ZSchemaType["review"],
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

  const validation = zSchema.review.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.message ?? "Missing or invalid required fields.",
      details: validation.error.flatten(),
    };
  }

  const { rating, review, service: serviceRaw, customField } = validation.data;
  const service = serviceRaw === "custom" ? customField?.trim() : serviceRaw;

  try {
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
      } catch (error) {
        console.warn("Failed to upload Clerk avatar, skipping.", error);
      }
    }

    const clientName = user.fullName || user.firstName || "Anonymous Client";

    const updatedReview = await writeClient.create({
      _type: "testimonial",
      status: "pending",
      name: clientName,
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0],
      review,
      rating: Number(rating),
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
      workAssets: assetRefs.length > 0 ? assetRefs : undefined,
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

    const resend = getResend();
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
        images: imageUrls,
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
