import { zSchema, ZSchemaType } from "@/lib/validators";
import { logoBase64, resend } from "@/lib/resend";
import { ContactEmail } from "@/components/emails/contact.email";

export async function createContactMessageService(
  formData: ZSchemaType["contact"],
) {
  const result = zSchema.contact.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: "Missing or invalid required fields.",
      details: result.error.flatten(),
    };
  }

  const { fName, lName, email, phone, inquiryType, message } = formData;
  const fullName = `${fName} ${lName}`.trim();

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      replyTo: email,
      subject: `New Contact Form Submission - ${inquiryType}`,
      react: ContactEmail({
        fullName,
        email,
        phone,
        inquiryType,
        message,
      }),
      attachments: [
        {
          filename: "logo.png",
          content: logoBase64,
          contentId: "logo",
        },
      ],
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to send your message at this time.",
    };
  }
}
