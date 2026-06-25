"use server";

import { writeClient } from "@/sanity/lib/client";
import { randomUUID } from "crypto";

interface UploadedToSanityReturn {
  _key: string;
  _type: string;
  asset: {
    _type: string;
    _ref: string;
  };
}

export async function downloadAndUploadToSanity(
  blobUrls: string[],
  type: string,
): Promise<UploadedToSanityReturn[]> {
  try {
    const uploads = await Promise.all(
      blobUrls.map(async (blobUrl) => {
        const response = await fetch(blobUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${blobUrl}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        const sanityAsset = await writeClient.assets.upload("image", buffer, {
          filename: blobUrl.split("/").pop() ?? "upload.jpg",
        });

        return {
          _key: randomUUID(),
          _type: type,
          asset: {
            _type: "reference",
            _ref: sanityAsset._id,
          },
        };
      }),
    );

    return uploads;
  } catch (error) {
    console.error("Sanity upload failed:", error);
    throw new Error(error instanceof Error ? error.message : "Upload failed");
  }
}
