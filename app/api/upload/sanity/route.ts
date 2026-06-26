import { MAX_SIZE_UPLOAD } from "@/lib/zod";
import {
  enforceRateLimit,
  safeFilename,
  SecurityError,
  validateImageUpload,
} from "@/lib/security";
import { writeClient } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit("upload", 20, 60_000, userId);

    // 2. Parse the FormData (expects a single 'file')
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file size and actual image signature on the server
    if (file.size > MAX_SIZE_UPLOAD) {
      return Response.json({ error: "File too large" }, { status: 413 });
    }
    await validateImageUpload(file);

    // 4. Upload directly to Sanity from the server
    const asset = await writeClient.assets.upload("image", file, {
      filename: safeFilename(file.name),
    });

    return Response.json({ _id: asset._id, url: asset.url });
  } catch (error) {
    if (error instanceof SecurityError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Sanity upload failed:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
