import { writeClient } from "./client";

/**
 * Uploads a file to Sanity assets
 * @param formData - FormData containing the 'file' field
 */
export async function uploadAsset(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    if (!asset._id || !asset.assetId) {
      throw new Error(`Error uploading ${file.name}`);
    }

    return { success: true, id: asset._id, url: asset.url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

/**
 * Deletes an asset from Sanity
 * @param assetId - Sanity asset document ID
 */
export async function deleteAsset(assetId: string) {
  await writeClient.delete(assetId);
  return { success: true };
}
