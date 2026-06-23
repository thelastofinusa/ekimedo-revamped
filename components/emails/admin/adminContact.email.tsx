import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Button, Hr, Link, Text } from "@react-email/components";

export const AdminContactEmail = (props: {
  fName: string;
  lName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  const fullName = `${props.fName} ${props.lName}`.trim();

  const replyUrl = `mailto:${props.email}?subject=${encodeURIComponent(
    `Re: Your ${props.inquiryType} Inquiry`,
  )}&cc=${encodeURIComponent(siteConfig.supportEmail as string)}`;

  return (
    <EmailLayout
      preview={`New contact message from ${fullName}`}
      title="New Contact Form Submission"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6">
        A new message has been submitted through your website’s contact form and
        requires your attention.
      </Text>

      <Text className="mt-4 text-sm leading-6">
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

      <Text className="mt-4 border-l-2 border-input pl-4 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
        “{props.message}”
      </Text>

      <Button
        href={replyUrl}
        className="bg-primary mt-4 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        Reply to {props.fName}
      </Button>
    </EmailLayout>
  );
};
