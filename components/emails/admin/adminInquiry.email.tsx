import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Hr, Img, Text, Link, Button } from "@react-email/components";

export const AdminInquiryEmail = (props: {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  budget: number;
  dreamDress: string;
  inspirationPhotos?: string[];
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
  inquiryId: string;
}) => {
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

          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            role="presentation"
            style={{ marginTop: "16px" }}
          >
            <tbody>
              <tr>
                {props.inspirationPhotos.slice(0, 2).map((image, index) => (
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
                  {props.inspirationPhotos.slice(2, 4).map((image, index) => (
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
        className="bg-primary mt-4 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        View Inquiry Details
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
