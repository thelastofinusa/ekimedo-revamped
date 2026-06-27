import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export { metadata, viewport } from "next-sanity/studio";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { userId } = await auth();

  const ADMIN_IDS = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!userId || !ADMIN_IDS.includes(userId)) {
    redirect("/");
  }

  return <NextStudio config={config} />;
}
