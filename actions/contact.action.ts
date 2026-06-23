"use server";

import { getResend } from "@/lib/resend";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { AdminContactEmail } from "@/components/emails/admin/adminContact.email";

export async function submitContactForm(formData: ZSchemaType["contact"]) {
  const resend = getResend();
  const result = zSchema.contact.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      message: result.error.message ?? "Missing or invalid required fields.",
      details: result.error.flatten(),
    };
  }

  try {
    const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      replyTo: formData.email,
      subject: `New Contact Form Submission - ${formData.inquiryType}`,
      react: AdminContactEmail({
        fName: formData.fName,
        lName: formData.lName,
        email: formData.email,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        message: formData.message,
        socialHandles,
      }),
    });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you in 24/48 hours",
    };
  } catch (error) {
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
