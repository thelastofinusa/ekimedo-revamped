import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Hr, Link, Text } from "@react-email/components";

export const CustomerReviewRequestEmail = (props: {
  customerName: string;
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  const reviewUrl = `${siteConfig.url}/reviews/submit`;

  return (
    <EmailLayout
      preview="You have been invited to submit a testimonial"
      title="Share Your Experience"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        Hello <strong>{props.customerName}</strong>,
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Thank you for choosing {siteConfig.title}. We truly appreciate the
        opportunity to have worked with you.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        You have now been granted permission to submit a testimonial about your
        experience with us. We would love to hear your thoughts, feedback, and
        any details you&apos;d like to share about your journey. To submit your
        testimonial, please visit{" "}
        <Link href={reviewUrl} className="text-primary underline">
          our testimonial submission page
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Once submitted, your testimonial will be reviewed by our team before it
        is published on our website. This helps us ensure that all testimonials
        meet our community guidelines and maintain the quality of the reviews we
        share with future clients.
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 text-[#3c4043]">
        Thank you for your support and for taking the time to share your
        experience. Your feedback helps us continue improving and assists future
        clients in making informed decisions.
      </Text>

      <Text className="mt-8 text-sm leading-6 text-[#3c4043]">
        Best regards,
        <br />
        {siteConfig.author.fName} {siteConfig.author.lName}
      </Text>
    </EmailLayout>
  );
};
