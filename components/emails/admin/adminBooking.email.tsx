import { EmailLayout } from "@/components/shared/emailLayout";
import { siteConfig } from "@/config/site.config";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { Button, Hr, Link, Text } from "@react-email/components";

export const AdminBookingEmail = (props: {
  bookingId: string;
  consultationTitle: string;
  dateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;
  formFields: {
    fieldLabel: string;
    fieldType: string;
    fieldName: string;
    value: string;
    files?: { url: string }[];
  }[];
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
}) => {
  const bookingUrl = `${siteConfig.url}/admin/structure/consultationsBookings;booking;${props.bookingId}`;

  // Format date for display
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
  const isVirtual = location?.value?.toLowerCase().includes("virtual");

  return (
    <EmailLayout
      preview={`New booking for ${props.consultationTitle} from ${props.customerName}`}
      title="New Consultation Booking"
      socialHandles={props.socialHandles}
    >
      <Text className="text-sm leading-6 text-[#3c4043]">
        A new consultation booking has been made through your website.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        <strong>{props.customerName}</strong> has booked a{" "}
        <strong>{props.consultationTitle}</strong> consultation on{" "}
        <strong>{formattedDate}</strong>.
      </Text>

      <Text className="mt-4 text-sm leading-6 text-[#3c4043]">
        Customer details:
        <br />
        Email:{" "}
        <Link
          href={`mailto:${props.customerEmail}`}
          className="text-primary underline"
        >
          {props.customerEmail}
        </Link>
        {props.customerPhone && (
          <>
            <br />
            Phone:{" "}
            <Link
              href={`tel:${props.customerPhone}`}
              className="text-primary underline"
            >
              {props.customerPhone}
            </Link>
          </>
        )}
      </Text>

      <Hr className="my-6" />

      <Text className="text-sm leading-6 font-medium text-[#3c4043]">
        Booking Details
      </Text>

      <Text className="text-sm leading-6 text-[#3c4043]">
        <strong>Consultation:</strong> {props.consultationTitle}
        <br />
        <strong>Date & Time:</strong> {formattedDate}
        <br />
        <strong>Location:</strong> {location?.value}
      </Text>

      {isVirtual ? (
        <Text className="mt-4 border-l-2 border-[#e5e7eb] pl-4 text-[13px] leading-6 whitespace-pre-wrap text-[#6b7280]">
          This is a virtual consultation. Please create a meeting link and send
          it to the customer before the scheduled appointment. You may use
          Google Meet, Zoom, Microsoft Teams, or any other video conferencing
          platform you prefer.{" "}
          <Link
            href="https://meet.google.com/landing"
            className="text-primary underline"
          >
            Create a Google Meet
          </Link>
        </Text>
      ) : (
        <Text className="mt-4 border-l-2 border-[#e5e7eb] pl-4 text-[13px] leading-6 whitespace-pre-wrap text-[#6b7280]">
          This consultation will take place in person. Please ensure all
          preparations are completed before the customer&apos;s arrival.
        </Text>
      )}

      <Hr className="my-6" />

      <Button
        href={bookingUrl}
        className="bg-primary mt-4 px-5 py-3 text-xs uppercase tracking-widest font-normal text-white"
      >
        View Booking Details
      </Button>

      <Text className="mt-6 text-sm leading-6 whitespace-pre-wrap text-[#3c4043]">
        If the button above does not open automatically,{" "}
        <Link href={bookingUrl} className="text-primary underline">
          click here
        </Link>{" "}
        or copy and paste the following URL into your browser:
      </Text>

      <Link
        href={bookingUrl}
        className="mt-6 text-sm leading-6 break-all text-primary underline"
      >
        {bookingUrl}
      </Link>
    </EmailLayout>
  );
};
