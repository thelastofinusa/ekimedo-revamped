import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Text } from "@react-email/components";

export const CustomerInquiryEmail = (props: {
  fullName: string;
  eventType: string;
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  return (
    <EmailLayout
      preview="We’ve received your enquiry"
      title="Enquiry Received"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        Hi <strong>{props.fullName}</strong>,
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Thank you for reaching out regarding your{" "}
        <strong>{props.eventType}</strong> enquiry. We will review your request
        and get back to you as soon as possible, typically within 24–48 hours.
      </Text>

      <Text className="text-sm leading-6 text-[#3c4043]">
        If you need to make any changes or have additional details to share,
        feel free to reply to this email.
      </Text>

      <Text className="mt-8 text-sm leading-6 text-[#3c4043]">
        Best regards,
        <br />
        {siteConfig.author.fName} {siteConfig.author.lName}
      </Text>
    </EmailLayout>
  );
};
