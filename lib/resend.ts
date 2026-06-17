import path from "path";
import sharp from "sharp";
import { Resend } from "resend";
import { readFileSync } from "fs";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Convert the SVG to a PNG buffer
const logoSvgPath = path.join(
  process.cwd(),
  "public",
  "assets",
  "logo",
  "horizontal-charcoal.png",
);
const svgBuffer = readFileSync(logoSvgPath);

const pngBuffer = await sharp(svgBuffer)
  .resize(280) // optional: set width to match your email layout
  .png()
  .toBuffer();

export const logoBase64 = pngBuffer.toString("base64");
