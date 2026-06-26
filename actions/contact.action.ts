"use server";

import { getResend } from "@/lib/resend";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { AdminContactEmail } from "@/components/emails/admin/adminContact.email";
import { queueEmailTask } from "@/lib/email-queue";
import {
  enforceRateLimit,
  SecurityError,
  verifyTurnstileToken,
} from "@/lib/security";

type ContactResult =
  | { success: true; message: string }
  | { success: false; message: string; details?: unknown };

export async function submitContactForm(
  formData: ZSchemaType["contact"],
): Promise<ContactResult> {
  const validation = zSchema.contact.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.message ?? "Missing or invalid required fields.",
      details: validation.error.flatten(),
    };
  }

  // const { fName,email,inquiryType,lName,message,phone,customField} = validation.data;

  try {
    await enforceRateLimit("contact", 5, 60_000, validation.data.email);
    await verifyTurnstileToken(validation.data.captchaToken, "contact");

    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    queueEmailTask(async () => {
      const resend = getResend();
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
        replyTo: validation.data.email,
        subject: `New Contact Form Submission - ${validation.data.inquiryType}`,
        react: AdminContactEmail({
          fName: validation.data.fName,
          lName: validation.data.lName,
          email: validation.data.email,
          phone: validation.data.phone,
          inquiryType: validation.data.inquiryType,
          message: validation.data.message,
          socialHandles,
        }),
      });

      if (error) throw new Error(error.message);
    });

    return {
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you in 24/48 hours",
    };
  } catch (error) {
    if (error instanceof SecurityError) {
      return { success: false, message: error.message };
    }
    console.error("Failed to send contact email:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send your message at this time.",
    };
  }
}
