import path from "path";
import { Resend } from "resend";
import { readFileSync } from "fs";

export const resend = new Resend(process.env.RESEND_API_KEY);

const logoPath = path.join(
  process.cwd(),
  "public",
  "assets",
  "logo",
  "horizontal-charcoal.png",
);
const logoBuffer = readFileSync(logoPath);
export const logoBase64 = logoBuffer.toString("base64");
