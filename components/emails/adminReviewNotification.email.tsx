import { siteConfig } from "@/config/site.config";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr, Img } from "@react-email/components";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";

interface AdminReviewNotificationEmailProps {
  fullName: string;
  service: string;
  rating: number;
  review: string;
  images?: string[];
  testimonialId: string;
  socialHandles?: SOCIAL_QUERY_RESULT;
}

export const AdminReviewNotificationEmail = ({
  fullName,
  service,
  rating,
  review,
  images = [],
  testimonialId,
  socialHandles,
}: AdminReviewNotificationEmailProps) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const orderUrl = `${siteConfig.url}/admin/structure/websiteContent;testimonial;${testimonialId}`;

  return (
    <EmailLayout
      preview={`New review received from ${fullName}`}
      title="New Review Submission"
      socialHandles={socialHandles}
    >
      {/* Intro */}
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new customer review has been submitted through your website.
      </Text>

      {/* Customer Info */}
      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Submitted by <strong>{fullName}</strong> regarding{" "}
        <strong>{service}</strong>.
      </Text>

      <Text className="mt-2 text-sm leading-6 text-[#3c4043]">
        Rating: <strong>{stars}</strong> ({rating}/5)
      </Text>

      <Hr className="my-6" />

      {/* Review */}
      <Text className="text-sm text-[#3c4043]">Customer Testimonial</Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-sm leading-6 whitespace-pre-wrap text-[#6b7280]">
        “{review}”
      </Text>

      {/* Images */}
      {images && images.length > 0 && (
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
                {images.slice(0, 3).map((image, index) => (
                  <td key={index} width="33%" style={{ paddingRight: "8px" }}>
                    <Img
                      src={image}
                      alt={`Inspiration ${index + 1}`}
                      width="180"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {images.length > 3 && (
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ marginTop: "8px" }}
            >
              <tbody>
                <tr>
                  {images.slice(3, 6).map((image, index) => (
                    <td key={index} width="33%" style={{ paddingRight: "8px" }}>
                      <Img
                        src={image}
                        alt={`Inspiration ${index + 4}`}
                        width="180"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                        }}
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

      {/* Footer Note */}
      <Text className="text-sm leading-6 text-[#3c4043]">
        To approve this review and make it visible on your website{" "}
        <Link href={orderUrl} className="text-primary underline">
          click here
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        If the link above does not open automatically, copy and paste the
        following URL into your browser:
      </Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-xs leading-6 break-all text-[#6b7280]">
        {orderUrl}
      </Text>
    </EmailLayout>
  );
};

export default AdminReviewNotificationEmail;
