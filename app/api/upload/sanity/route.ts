import { MAX_SIZE_UPLOAD } from "@/lib/zod";
import { writeClient } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the FormData (expects a single 'file')
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // 3. Optional: validate file size / type again on the server
  if (file.size > MAX_SIZE_UPLOAD) {
    return Response.json({ error: "File too large" }, { status: 413 });
  }

  // 4. Upload directly to Sanity from the server
  try {
    const asset = await writeClient.assets.upload("image", file, {
      filename: file.name,
    });

    return Response.json({ _id: asset._id, url: asset.url });
  } catch (error) {
    console.error("Sanity upload failed:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
