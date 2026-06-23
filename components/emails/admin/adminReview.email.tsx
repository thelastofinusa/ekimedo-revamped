import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Button, Hr, Img, Link, Text } from "@react-email/components";

export const AdminReviewEmail = (props: {
  fullName: string;
  service: string;
  rating: number;
  review: string;
  images?: string[];
  testimonialId: string;
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  const stars = "★".repeat(props.rating) + "☆".repeat(5 - props.rating);
  const orderUrl = `${siteConfig.url}/admin/structure/websiteContent;testimonial;${props.testimonialId}`;

  return (
    <EmailLayout
      preview={`New review received from ${props.fullName}`}
      title="New Review Submission"
      socialHandles={props.socialHandles}
    >
      {/* Intro */}
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new customer review has been submitted through your website.
      </Text>

      {/* Customer Info */}
      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Submitted by <strong>{props.fullName}</strong> regarding{" "}
        <strong>{props.service}</strong>.
      </Text>

      <Text className="mt-2 text-sm leading-6 text-[#3c4043]">
        Rating: <strong>{stars}</strong> ({props.rating}/5)
      </Text>

      <Hr className="my-6" />

      {/* Review */}
      <Text className="text-sm text-[#3c4043]">Customer Testimonial</Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-sm leading-6 whitespace-pre-wrap text-[#6b7280]">
        “{props.review}”
      </Text>

      {/* Images */}
      {props.images && props.images.length > 0 && (
        <>
          <Hr className="my-6" />

          <Text className="text-sm leading-6 font-medium text-[#3c4043]">
            Attached Images
          </Text>

          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            role="presentation"
            style={{ marginTop: "16px" }}
          >
            <tbody>
              <tr>
                {props.images.slice(0, 2).map((image, index) => (
                  <td key={index} width="33%" style={{ paddingRight: "8px" }}>
                    <Img
                      src={image}
                      alt={`Inspiration ${index + 1}`}
                      width="180"
                      height="auto"
                      className="w-full border border-[#e5e7eb] object-cover"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {props.images.length > 3 && (
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ marginTop: "8px" }}
            >
              <tbody>
                <tr>
                  {props.images.slice(2, 4).map((image, index) => (
                    <td key={index} width="33%" style={{ paddingRight: "8px" }}>
                      <Img
                        src={image}
                        alt={`Inspiration ${index + 4}`}
                        width="180"
                        height="auto"
                        className="w-full border border-[#e5e7eb] object-cover"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </>
      )}

      <Hr className="my-6" />

      <Button
        href={orderUrl}
        className="bg-primary mt-6 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        Approve Review
      </Button>

      <Text className="mt-6 text-sm leading-6 whitespace-pre-wrap text-[#3c4043]">
        If the button above does not open automatically,{" "}
        <Link href={orderUrl} className="text-primary underline">
          click here
        </Link>{" "}
        or copy and paste the following URL into your browser:
      </Text>

      <Link
        href={orderUrl}
        className="mt-6 text-sm leading-6 break-all text-primary underline"
      >
        {orderUrl}
      </Link>
    </EmailLayout>
  );
};
