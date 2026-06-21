import { siteConfig } from "@/config/site.config";
import { tailwindConfig } from "@/config/tailwind.config";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Img,
  Hr,
  Tailwind,
  pixelBasedPreset,
  Button,
} from "react-email";

interface SocialLink {
  name: string | null;
  url: string | null;
}

export interface AdminBookingNotificationProps {
  customerName: string;
  serviceTitle: string;
  dateTime: string | Date;
  location: "in-person" | "virtual";
  bookingId: string;
  siteUrl?: string;
  socialLinks?: SocialLink[];
  eventDate?: string | Date | null;
  budgetType?: string | null;
  paymentMethod?: string | null;
  rushOrder?: string | null;
  interests?: string[];
  dressSize?: string | null;
  dressColor?: string | null;
  specialRequirements?: string | null;
}

const baseUrl = siteConfig.url;

export const AdminBookingNotificationEmail = ({
  customerName,
  serviceTitle,
  dateTime,
  location,
  bookingId,
  siteUrl,
  socialLinks = [],
  eventDate,
  budgetType,
  paymentMethod,
  rushOrder,
  interests,
  dressSize,
  dressColor,
  specialRequirements,
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

  const eventDateStr = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const budgetLabel = budgetType || null;
  const paymentMethodLabel = paymentMethod
    ? paymentMethod === "stripe"
      ? "Credit Card (Stripe)"
      : "PayPal"
    : null;

  return (
    <Html>
      <Head />
      <Tailwind config={tailwindConfig}>
        <Body className="text-foreground font-sans">
          <Preview>
            New Consultation: {serviceTitle} - {customerName}
          </Preview>
          <Container className="relative mx-auto overflow-hidden">
            {/* Content */}
            <Section className="relative">
              <Text className="text-primary text-base leading-[26px] font-medium">
                New {serviceTitle} Booking
              </Text>
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
                    {eventDateStr && (
                      <tr>
                        <td className="py-1 font-semibold">Event Date</td>
                        <td className="py-1">{eventDateStr}</td>
                      </tr>
                    )}
                    {budgetLabel && (
                      <tr>
                        <td className="py-1 font-semibold">Budget</td>
                        <td className="py-1">{budgetLabel}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1 font-semibold">Payment</td>
                      <td className="py-1">{paymentMethodLabel}</td>
                    </tr>
                    {rushOrder && (
                      <tr>
                        <td className="py-1 font-semibold">Rush Order</td>
                        <td className="py-1">
                          {rushOrder === "yes" ? "Yes" : "No"}
                        </td>
                      </tr>
                    )}
                    {interests && interests.length > 0 && (
                      <tr>
                        <td className="py-1 font-semibold">Interests</td>
                        <td className="py-1">{interests.join(", ")}</td>
                      </tr>
                    )}
                    {dressSize && (
                      <tr>
                        <td className="py-1 font-semibold">Dress Size</td>
                        <td className="py-1">{dressSize}</td>
                      </tr>
                    )}
                    {dressColor && (
                      <tr>
                        <td className="py-1 font-semibold">Preferred Color</td>
                        <td className="py-1">{dressColor}</td>
                      </tr>
                    )}
                    {specialRequirements && (
                      <tr>
                        <td className="py-1 font-semibold">
                          Special Requirements
                        </td>
                        <td className="py-1">{specialRequirements}</td>
                      </tr>
                    )}
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
                <br />© {new Date().getFullYear()} {siteConfig.title}. All
                rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AdminBookingNotificationEmail;
