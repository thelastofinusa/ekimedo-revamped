import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Lightweight health check endpoint that verifies core dependencies.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  let healthy = true;

  // Check Sanity CMS connectivity
  try {
    await client.fetch<number>(`count(*[_type == "product"])`);
    checks.sanity = "ok";
  } catch {
    checks.sanity = "error";
    healthy = false;
  }

  // Check required environment variables
  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "RESEND_API_KEY",
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
  ];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  checks.env = missingVars.length === 0 ? "ok" : "error";
  if (missingVars.length > 0) healthy = false;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      ...(missingVars.length > 0 && { missingEnvVars: missingVars }),
    },
    { status: healthy ? 200 : 503 },
  );
}
