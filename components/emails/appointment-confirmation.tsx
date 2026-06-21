import { siteConfig } from "@/config/site.config";
import { tailwindConfig } from "@/config/tailwind.config";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
  Hr,
  Tailwind,
  pixelBasedPreset,
  Button,
} from "react-email";

const baseUrl = siteConfig.url;

interface SocialLink {
  name: string | null;
  url: string | null;
}

export interface AppointmentConfirmationProps {
  customerName: string;
  serviceTitle: string;
  serviceSlug?: string;
  dateTime: string | Date;
  location: "in-person" | "virtual";
  calendarUrl: string;
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

export const AppointmentConfirmationEmail = ({
  customerName,
  serviceTitle,
  serviceSlug,
  dateTime,
  location,
  calendarUrl,
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
}: AppointmentConfirmationProps) => {
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
          <Preview>Appointment Confirmed: {serviceTitle}</Preview>
          <Container className="relative mx-auto overflow-hidden">
            <Section className="relative">
              <Text className="text-primary text-base leading-[26px] font-medium">
                {serviceSlug === "bridal"
                  ? "Your Bridal Journey Begins"
                  : serviceSlug === "prom"
                    ? "Your Prom Design Session"
                    : serviceSlug === "try-on"
                      ? serviceTitle
                      : "Your Consultation is Confirmed"}
              </Text>
              <Text className="text-sm">
                Dear <strong>{customerName}</strong>, we are delighted to
                confirm your upcoming consultation for{" "}
                <strong>{serviceTitle}</strong>.
              </Text>

              <div className="z-50 mt-6 rounded border border-gray-200 bg-white p-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-semibold">Service</td>
                      <td className="py-1">{serviceTitle}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">When</td>
                      <td className="py-1">
                        {dateStr}
                        <br />
                        <span className="text-xs text-gray-500">{timeStr}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 align-top font-semibold">Where</td>
                      <td className="py-1">
                        {location === "in-person" ? (
                          <>
                            Showroom (In-Person)
                            <br />
                            <Link
                              href="https://maps.app.goo.gl/bpVmXDswvhJ9Y72K7"
                              className="text-primary text-xs"
                            >
                              1211 Marblewood Ave, Capitol Heights, MD 20743 →
                            </Link>
                          </>
                        ) : (
                          "Virtual Consultation (Zoom/Meet)"
                        )}
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
                    {paymentMethodLabel && (
                      <tr>
                        <td className="py-1 font-semibold">Payment</td>
                        <td className="py-1">{paymentMethodLabel}</td>
                      </tr>
                    )}
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
                        <td className="py-1 font-semibold">Size</td>
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
                        <td className="py-1 font-semibold">Notes</td>
                        <td className="py-1">{specialRequirements}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Service-specific advice */}
              {location === "in-person" && (
                <>
                  {serviceSlug === "try-on" && (
                    <div className="border-primary mt-6 rounded border p-4 text-center">
                      <Text className="text-primary font-serif text-lg italic">
                        Preparing for your try-on consultation
                      </Text>
                      <ul className="list-disc pl-5 text-left text-sm">
                        <li>Wear nude or brown panties for a seamless look.</li>
                        <li>
                          Avoid using deodorant or body cologne to keep the
                          gowns pristine.
                        </li>
                        <li>
                          You may try on a maximum of 3 dresses within your
                          1-hour session.
                        </li>
                      </ul>
                    </div>
                  )}
                  {serviceSlug === "prom" && (
                    <div className="border-primary mt-6 rounded border p-4 text-center">
                      <Text className="text-primary font-serif text-lg italic">
                        Preparing for your Prom Consultation
                      </Text>
                      <ul className="list-disc pl-5 text-left text-sm">
                        <li>
                          Wear a fitted outfit for accurate body measurements.
                        </li>
                        <li>
                          Bring at least three style inspirations to discuss
                          with the head designer.
                        </li>
                        <li>
                          Think about the color palette that best suits your
                          skin tone and theme.
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div className="border-primary mt-6 rounded border-l-4 bg-gray-50 p-4">
                <Text className="text-sm font-bold uppercase">
                  Arrival &amp; Cancellation Policy
                </Text>
                <Text className="text-sm">
                  Please arrive promptly for your consultation. A late fee of
                  $20 applies after 10 minutes, and appointments are
                  automatically canceled after 15 minutes of delay.
                </Text>
                {location === "in-person" && (
                  <Text className="text-sm">
                    Parking is available right in front of 1211. The address
                    appears as an auto body shop/warehouse on the map, which is
                    accurate, and our store is located inside the building.{" "}
                    <Link
                      href="tel:+12029074865"
                      className="text-primary font-semibold"
                    >
                      202-907-4865
                    </Link>{" "}
                    is the number to call when you arrive. Parking is not
                    charged.
                  </Text>
                )}
              </div>

              <Button
                href={calendarUrl}
                className="bg-primary mt-6 flex w-max items-center justify-center rounded-[4px] px-4 py-3 text-sm text-white no-underline"
              >
                Add to Calendar
              </Button>

              <Text className="mt-6 text-sm">Best regards,</Text>
              <Text className="font-serif text-xl italic">
                {siteConfig.author.fullName}
              </Text>
            </Section>

            <Section className="py-5">
              <Hr className="mb-5 border-[#e8eaed]" />
              <Text className="text-center text-xs leading-[22px] opacity-50">
                Need to reschedule? Send an email to{" "}
                <Link href="mailto:info@ekimedo.com" className="text-primary">
                  info@ekimedo.com
                </Link>
                .
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

export default AppointmentConfirmationEmail;
