import { siteConfig } from "@/config/site.config";
import { EmailLayout } from "../shared/email-layout";
import { Text, Link, Hr, Img, Section } from "@react-email/components";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";

interface AdminConsultationNotificationEmailProps {
  bookingId: string;
  consultationType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  consultationDate: string;
  eventDate?: string;
  location?: string;
  paymentMethod?: string;
  formData: Record<string, unknown>;
  socialHandles?: SOCIAL_QUERY_RESULT;
}

const HIDDEN_FIELDS = [
  "_id",
  "_type",
  "_createdAt",
  "_updatedAt",
  "_rev",
  "slug",
  "consultationSlug",
];

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (str) => str.toUpperCase());

export const AdminConsultationNotificationEmail: React.FC<
  AdminConsultationNotificationEmailProps
> = ({
  bookingId,
  consultationType,
  customerName,
  customerEmail,
  customerPhone,
  consultationDate,
  formData,
  socialHandles,
}) => {
  const studioUrl = `${siteConfig.url}/studio/structure/booking;${bookingId}`;

  return (
    <EmailLayout
      preview={`New ${consultationType} booking from ${customerName}`}
      title="New Consultation Booking"
      socialHandles={socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new consultation booking has been submitted through your website.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        <strong>{customerName}</strong> booked a{" "}
        <strong>{consultationType}</strong> consultation and can be reached at{" "}
        <Link
          href={`mailto:${customerEmail}`}
          className="text-primary underline"
        >
          {customerEmail}
        </Link>{" "}
        or{" "}
        <Link href={`tel:${customerPhone}`} className="text-primary underline">
          {customerPhone}
        </Link>
        .
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 font-medium text-[#3c4043]">
        Booking Details
      </Text>

      {Object.entries(formData)
        .filter(([key]) => !HIDDEN_FIELDS.includes(key))
        .map(([key, value]) => {
          const isImages =
            Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === "string" &&
            String(value[0]).startsWith("http");

          return (
            <Section key={key} className="mt-4">
              <Text className="m-0 text-xs font-semibold text-[#6b7280] uppercase">
                {formatLabel(key)}
              </Text>

              {isImages ? (
                <Section className="mt-2">
                  {(value as string[]).map((image, index) => (
                    <Img
                      key={index}
                      src={image}
                      alt={`${key}-${index}`}
                      width="120"
                      height="120"
                      className="mr-2 mb-2 inline-block rounded-md object-cover"
                    />
                  ))}
                </Section>
              ) : (
                <Text className="mt-1 text-sm leading-6 text-[#3c4043]">
                  {Array.isArray(value)
                    ? value.join(", ")
                    : String(value ?? "-")}
                </Text>
              )}
            </Section>
          );
        })}

      <Hr className="my-6" />

      <Text className="text-sm leading-6 text-[#3c4043]">
        To review the complete booking record,{" "}
        <Link href={studioUrl} className="text-primary underline">
          click here
        </Link>
        .
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        If the link above does not open automatically, copy and paste the
        following URL into your browser:
      </Text>

      <Text className="mt-2 border-l-2 border-[#e5e7eb] pl-4 text-xs leading-6 break-all text-[#6b7280]">
        {studioUrl}
      </Text>
    </EmailLayout>
  );
};

export default AdminConsultationNotificationEmail;
