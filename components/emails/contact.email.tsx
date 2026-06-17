import { siteConfig } from "@/config/site.config";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
} from "@react-email/components";

interface ContactEmailProps {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export function ContactEmail({
  fullName,
  email,
  phone,
  inquiryType,
  message,
}: ContactEmailProps) {
  return (
    <Html lang="en">
      <Head />

      <Preview>
        New {inquiryType} inquiry from {fullName}
      </Preview>

      <Tailwind>
        <Body className="bg-zinc-100 py-10 font-sans">
          <Container className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-white p-10">
            {/* Logo */}
            <Img
              src={`${siteConfig.url}/assets/logo/horizontal-charcoal.png`}
              alt="Ekimedo"
              width="140"
            />

            {/* Heading */}
            <Heading className="m-0 text-2xl font-bold text-zinc-950">
              New Contact Inquiry
            </Heading>

            <Text className="mt-4 text-base leading-7 text-zinc-600">
              A visitor submitted a new contact form through the website.
              Details are included below.
            </Text>

            {/* Customer Info */}
            <Section className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
              <Text className="m-0 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Customer Details
              </Text>

              <div className="mt-4 space-y-2">
                <Text className="m-0">
                  <strong>Name:</strong> {fullName}
                </Text>

                <Text className="m-0">
                  <strong>Email:</strong> {email}
                </Text>

                <Text className="m-0">
                  <strong>Phone:</strong> {phone}
                </Text>

                <Text className="m-0">
                  <strong>Inquiry Type:</strong> {inquiryType}
                </Text>
              </div>
            </Section>

            {/* Message */}
            <Section className="mt-8">
              <Text className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Message
              </Text>

              <Section className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                <Text className="m-0 text-base leading-7 whitespace-pre-wrap text-zinc-700">
                  {message}
                </Text>
              </Section>
            </Section>

            {/* CTA */}
            <Section className="mt-8">
              <Button
                href={`mailto:${email}`}
                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                Reply to Customer
              </Button>
            </Section>

            <Hr className="my-8 border-zinc-200" />

            {/* Footer */}
            <Text className="text-sm leading-6 text-zinc-500">
              This notification was generated automatically from your website
              contact form.
            </Text>

            <Text className="mt-2 text-sm text-zinc-500">
              Replying to this email will send a message directly to{" "}
              <strong>{fullName}</strong>.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
