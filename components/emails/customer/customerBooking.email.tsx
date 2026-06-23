import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Hr, Link, Text } from "@react-email/components";

export const CustomerBookingEmail = (props: {
  customerName: string;
  consultationTitle: string;
  dateTime: string;
  bookingId: string;
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
  formFields: {
    fieldLabel: string;
    fieldType: string;
    fieldName: string;
    value: string;
    files?: { url: string }[];
  }[];
}) => {
  const bookingDate = new Date(props.dateTime);

  const formattedDate = bookingDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const location =
    props.formFields &&
    props.formFields.find((field) => field.fieldName === "location");
  const tryOn = props.consultationTitle.toLowerCase().includes("pre-made");
  const prom = props.consultationTitle.toLowerCase().includes("prom");

  const isVirtual = location?.value?.toLowerCase().includes("virtual");

  return (
    <EmailLayout
      preview={`Your ${props.consultationTitle} booking confirmation`}
      title="Booking Confirmation"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        Hello <strong>{props.customerName}</strong>,
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Thank you for booking a <strong>{props.consultationTitle}</strong>{" "}
        consultation with {siteConfig.title}. We have received your booking and
        it is now confirmed.
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 text-[#3c4043]">
        <strong>Consultation:</strong> {props.consultationTitle}
        <br />
        <strong>Date & Time:</strong> {formattedDate}
        <br />
        <strong>Location:</strong> {location?.value}
      </Text>

      {!isVirtual && (
        <Text className="text-[13px] leading-6 text-[#3c4043]">
          <Link
            href="https://maps.app.goo.gl/bpVmXDswvhJ9Y72K7"
            className="text-primary underline"
          >
            1211 Marblewood Ave, Capitol Heights, MD 20743 →
          </Link>
        </Text>
      )}

      <div className="my-4 border-l-2 pl-2 border-[#e5e7eb] white-space-wrap">
        {!isVirtual && (
          <Text className="text-[13px] leading-6 whitespace-pre-wrap text-[#6b7280]">
            Parking is available right in front of 1211. The address appears as
            an auto body shop/warehouse on the map, which is accurate, and our
            store is located inside the building.
          </Text>
        )}
        <Text className="text-[13px] leading-6 whitespace-pre-wrap text-[#6b7280]">
          Please arrive promptly for your consultation. A late fee of $20
          applies after 10 minutes, and appointments are automatically canceled
          after 15 minutes of delay.
        </Text>
      </div>

      {!isVirtual && tryOn && (
        <>
          <Hr className="my-6" />

          <Text className="text-sm font-medium leading-6 text-[#3c4043]">
            Preparing for your {props.consultationTitle}
          </Text>

          <ul
            style={{
              margin: "8px 0 0",
              paddingLeft: "20px",
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            <li>Wear nude or brown panties for a seamless look.</li>
            <li>
              Avoid using deodorant or body cologne to help keep the gowns
              pristine.
            </li>
            <li>
              You may try on a maximum of 3 dresses during your 1-hour session.
            </li>
          </ul>
        </>
      )}

      {!isVirtual && prom && (
        <>
          <Hr className="my-6" />

          <Text className="text-sm font-medium leading-6 text-[#3c4043]">
            Preparing for your {props.consultationTitle}
          </Text>

          <ul
            style={{
              margin: "8px 0 0",
              paddingLeft: "20px",
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            <li>Wear a fitted outfit for accurate body measurements.</li>
            <li>
              Bring at least three style inspirations to discuss with the head
              designer.
            </li>
            <li>
              Think about the color palette that best suits your skin tone and
              event theme.
            </li>
          </ul>
        </>
      )}

      <Hr className="my-6" />

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        We look forward to assisting you. If you need to make any changes or
        have questions, please don’t hesitate to reply to this email or contact
        us.
      </Text>

      <Text className="mt-8 text-sm leading-6 text-[#3c4043]">
        Best regards,
        <br />
        {siteConfig.author.fName} {siteConfig.author.lName}
      </Text>
    </EmailLayout>
  );
};
