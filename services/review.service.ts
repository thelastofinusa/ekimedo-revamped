import { randomUUID } from "crypto";
import { writeClient } from "@/sanity/lib/client";

interface UserInfo {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

export async function createReviewService(formData: FormData, user: UserInfo) {
  try {
    const review = formData.get("review") as string;
    const ratingRaw = formData.get("rating") as string;
    const serviceRaw = formData.get("service") as string;
    const customField = formData.get("customField") as string | null;
    const workAssets = formData.getAll("workAssets") as File[];

    const rating = Number(ratingRaw);
    const service = serviceRaw === "custom" ? customField?.trim() : serviceRaw;

    if (!review || !service || Number.isNaN(rating)) {
      return { success: false, error: "Missing or invalid required fields." };
    }

    const uploadedAssets = [];
    if (workAssets && workAssets.length > 0) {
      for (const image of workAssets) {
        if (image.size > 0) {
          const buffer = await image.arrayBuffer();
          const asset = await writeClient.assets.upload(
            "image",
            Buffer.from(buffer),
            {
              filename: image.name,
            },
          );
          uploadedAssets.push({
            _key: randomUUID(),
            _type: "asset",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          });
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
            filename: `avatar-${user.id}.jpg`, // or extract original name
          },
        );
      } catch (err) {
        console.warn("Failed to upload Clerk avatar, skipping.", err);
        // continue without the avatar
      }
    }

    const clientName = user.fullName || user.firstName || "Anonymous Client";

    await writeClient.create({
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

    return { success: true };
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit testimonial. Please try again.",
    };
  }
}
