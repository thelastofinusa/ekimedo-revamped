import { client } from "@/sanity/lib/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/health
 * Requires x-health-token header matching HEALTH_CHECK_SECRET env var.
 * Returns a neutral 200 to unauthorized callers to avoid leaking infrastructure details.
 */
export async function GET(request: NextRequest) {
  // Auth gate — return neutral response to unauthorized callers
  const token = request.headers.get("x-health-token");
  const secret = process.env.HEALTH_CHECK_SECRET;

  if (!secret || token !== secret) {
    // Intentionally vague — don't reveal that auth failed
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

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
    "TURNSTILE_SECRET_KEY",
    "SANITY_ACTION_SECRET",
    "CLERK_SECRET_KEY",
  ];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  checks.env = missingVars.length === 0 ? "ok" : "error";
  if (missingVars.length > 0) healthy = false;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      // Only reveal which vars are missing to authorized callers
      ...(missingVars.length > 0 && { missingEnvVars: missingVars }),
    },
    { status: healthy ? 200 : 503 },
  );
}
