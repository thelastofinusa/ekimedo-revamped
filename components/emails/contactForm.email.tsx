import { SOCIAL_QUERY_RESULT } from "@/sanity.types";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr } from "@react-email/components";

interface ContactEmailProps {
  fName: string;
  lName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  socialHandles?: SOCIAL_QUERY_RESULT;
}

export const ContactEmail = (props: ContactEmailProps) => {
  const fullName = `${props.fName} ${props.lName}`.trim();

  return (
    <EmailLayout
      preview={`New contact message from ${fullName}`}
      title="New Contact Form Submission"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new message has been submitted through your website’s contact form and
        requires your attention.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        The message was sent by <strong>{fullName}</strong>, who can be reached
        at{" "}
        <Link href={`mailto:${props.email}`} className="text-primary underline">
          {props.email}
        </Link>{" "}
        or by phone at{" "}
        <Link href={`tel:${props.phone}`} className="text-primary underline">
          {props.phone}
        </Link>
        . The inquiry is regarding <strong>{props.inquiryType}</strong>.
      </Text>

      <Text className="mt-4 border-l-2 border-[#e5e7eb] pl-4 text-sm leading-6 whitespace-pre-wrap text-[#6b7280]">
        “{props.message}”
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 text-[#3c4043]">
        You can reply directly to this email to respond to{" "}
        <strong>{props.fName}</strong>. If needed, you may also contact them by
        email or phone using the details above.
      </Text>
    </EmailLayout>
  );
};

export default ContactEmail;
