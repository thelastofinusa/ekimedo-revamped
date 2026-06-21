import { SOCIAL_QUERY_RESULT } from "@/sanity.types";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr, Img } from "@react-email/components";
import { siteConfig } from "@/config/site.config";

interface AdminEnquiryNotificationEmailProps {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  budget: number;
  dreamDress: string;
  inspirationPhotos?: string[];
  socialHandles?: SOCIAL_QUERY_RESULT;
  inquiryId: string;
}

export const AdminEnquiryNotificationEmail = (
  props: AdminEnquiryNotificationEmailProps,
) => {
  const orderUrl = `${siteConfig.url}/admin/structure/consultationsBookings;inquiry;${props.inquiryId}`;

  return (
    <EmailLayout
      preview={`New custom order enquiry from ${props.fullName}`}
      title="New Custom Order Enquiry"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new custom order enquiry has been submitted through your website.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        The enquiry was submitted by <strong>{props.fullName}</strong>, who can
        be reached at{" "}
        <Link href={`mailto:${props.email}`} className="text-primary underline">
          {props.email}
        </Link>{" "}
        or by phone at{" "}
        <Link href={`tel:${props.phone}`} className="text-primary underline">
          {props.phone}
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        The requested event type is <strong>{props.eventType}</strong>,
        scheduled for <strong>{props.eventDate}</strong>, with an estimated
        budget of <strong>${props.budget.toLocaleString()}</strong>.
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 font-medium text-[#3c4043]">
        Dream Dress Description
      </Text>

      <Text className="mt-3 border-l-2 border-[#e5e7eb] pl-4 text-sm leading-6 whitespace-pre-wrap text-[#6b7280]">
        “{props.dreamDress}”
      </Text>

      {props.inspirationPhotos && props.inspirationPhotos.length > 0 && (
        <>
          <Hr className="my-6" />

          <Text className="text-sm leading-6 font-medium text-[#3c4043]">
            Inspiration Photos
          </Text>

          <Text className="mt-2 text-sm leading-6 text-[#3c4043]">
            The customer attached the following reference images:
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
                {props.inspirationPhotos.slice(0, 3).map((image, index) => (
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

          {props.inspirationPhotos.length > 3 && (
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ marginTop: "8px" }}
            >
              <tbody>
                <tr>
                  {props.inspirationPhotos.slice(3, 6).map((image, index) => (
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

      <Text className="text-sm leading-6 text-[#3c4043]">
        To review the complete inquiry details{" "}
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

      <Text className="text-sm leading-6 text-[#3c4043]">
        You may contact the customer directly using the email address or phone
        number provided above.
      </Text>
    </EmailLayout>
  );
};

export default AdminEnquiryNotificationEmail;
