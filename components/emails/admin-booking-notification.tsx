import { siteConfig } from "@/config/site.config";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";
import { Section, Text, Hr, Button } from "react-email";
import { EmailLayout } from "../shared/email-layout";
import { Img } from "@react-email/components";

export interface FormFieldAnswer {
  fieldName: string;
  fieldLabel: string;
  fieldType?: string;
  value: string;
  files?: { url: string }[];
}

export interface AdminBookingNotificationProps {
  customerName: string;
  serviceTitle: string;
  dateTime: string | Date;
  location: "in-person" | "virtual";
  bookingId: string;
  siteUrl?: string;
  paymentMethod?: string | null;
  socialHandles?: SOCIAL_QUERY_RESULT;
  formFields?: FormFieldAnswer[];
}

export const AdminBookingNotificationEmail = ({
  customerName,
  serviceTitle,
  dateTime,
  location,
  bookingId,
  siteUrl,
  paymentMethod,
  formFields,
  socialHandles,
}: AdminBookingNotificationProps) => {
  const dateObj = new Date(dateTime);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const paymentMethodLabel = paymentMethod
    ? paymentMethod === "stripe"
      ? "Credit Card (Stripe)"
      : "PayPal"
    : null;

  return (
    <EmailLayout
      preview={`New Consultation: ${serviceTitle} - ${customerName}`}
      title={`New ${serviceTitle} Booking`}
      socialHandles={socialHandles}
    >
      {/* Content */}
      <Section className="relative">
        <Text className="text-sm">
          Hello <strong>{siteConfig.author.nickname}</strong>,
        </Text>
        <Text className="text-sm">
          A new <strong>{serviceTitle}</strong> has been booked by{" "}
          <strong>{customerName}</strong>. <br />
          The details are recorded below.
        </Text>

        {/* Details table */}
        <div className="mt-6 rounded border border-gray-200 p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-semibold">Customer</td>
                <td className="py-1">{customerName}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Service</td>
                <td className="py-1">{serviceTitle}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Date &amp; Time</td>
                <td className="py-1">
                  {dateStr}
                  <br />
                  <span className="text-xs text-gray-500">{timeStr}</span>
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Location</td>
                <td className="py-1">
                  {location === "in-person"
                    ? "Showroom (In-Person)"
                    : "Virtual Consultation"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Payment</td>
                <td className="py-1">{paymentMethodLabel}</td>
              </tr>
              {formFields?.map((f) => (
                <tr key={f.fieldName}>
                  <td className="py-1 align-top font-semibold">
                    {f.fieldLabel}
                  </td>
                  <td className="py-1">
                    {f.fieldType === "file" && f.files?.length
                      ? f.files.map((file, i) => (
                          <Img
                            key={i}
                            src={file.url}
                            width="80"
                            height="80"
                            alt={f.fieldLabel}
                            className="mr-8 mb-8 inline-block border-[6px] object-cover"
                          />
                        ))
                      : f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          href={`${siteUrl}/studio/structure/booking;${bookingId}`}
          className="bg-primary mt-6 flex w-max items-center justify-center rounded-[4px] px-4 py-3 text-sm text-white no-underline"
        >
          View in Studio
        </Button>
      </Section>

      {/* Footer */}
      <Section className="py-5">
        <Hr className="mb-5 border-[#e8eaed]" />
        <Text className="text-center text-xs leading-[22px] opacity-50">
          This is an automated notification from your booking system.
          <br />© {new Date().getFullYear()} {siteConfig.title}. All rights
          reserved.
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default AdminBookingNotificationEmail;
