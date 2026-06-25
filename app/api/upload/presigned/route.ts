import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const file = form.get("file") as File | null;
  const formType = (form.get("formType") as string) || "uploads";

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const blob = await put(`${formType}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return Response.json(blob);
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
