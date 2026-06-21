/* eslint-disable @next/next/no-page-custom-font */
import {
  Html,
  Head,
  Body,
  Tailwind,
  Preview,
  Container,
  Img,
  Section,
  Hr,
  Text,
  Link,
} from "@react-email/components";
import { tailwindConfig } from "@/config/tailwind.config";
import { siteConfig } from "@/config/site.config";
import { resolveIcon } from "@/lib/icons-registry";
import { SOCIAL_QUERY_RESULT } from "@/sanity.types";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
  title: string; // URL of the header logo
  socialHandles?: SOCIAL_QUERY_RESULT;
}

export function EmailLayout({
  children,
  preview,
  title,
  socialHandles,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Tailwind config={tailwindConfig}>
        <Body className="text-foreground font-sans">
          <Preview>{preview}</Preview>

          <Container className="mx-auto my-5 overflow-hidden">
            <Section className="px-3">
              <Img
                src="https://res.cloudinary.com/dbc3ctobv/image/upload/v1781974490/horizontal-charcoal_qqtcdk.svg"
                width="130"
                height="auto"
                alt={`${siteConfig.title}'s Logo`}
              />
            </Section>

            <Section className="px-3">
              <Hr className="my-5 border-[#e8eaed]" />

              <Text className="text-primary text-sm leading-[26px] font-semibold uppercase">
                {title}
              </Text>

              {children}
            </Section>

            <Section className="mt-5 px-3">
              <Hr className="mb-8 border-[#e8eaed]" />

              <Link href={siteConfig.url}>
                <Img
                  src="https://res.cloudinary.com/dbc3ctobv/image/upload/v1781974490/horizontal-charcoal_qqtcdk.svg"
                  width="130"
                  height="auto"
                  alt={`${siteConfig.title}'s Logo`}
                  className="text-muted-foreground mx-auto object-contain opacity-70"
                />
              </Link>

              {/* Brand line */}
              <Text className="text-muted-foreground text-center text-[11px] leading-[18px]">
                <Link href={siteConfig.url} className="text-primary">
                  {siteConfig.title}
                </Link>{" "}
                - {siteConfig.tagline}
              </Text>

              {/* Socials (compact row) */}
              {socialHandles?.length ? (
                <div className="mt-5 flex items-center justify-center gap-3">
                  {socialHandles.map((social) => {
                    const Icon = resolveIcon(social.icon);

                    return (
                      <a
                        key={social._id}
                        href={social.url || "#"}
                        target={social.url ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="text-muted-foreground"
                      >
                        {Icon && <Icon className="size-4" />}
                      </a>
                    );
                  })}
                </div>
              ) : null}

              {/* Divider (subtle separation) */}
              <Hr className="my-6 border-[#f3f4f6]" />

              {/* Legal (compressed) */}

              <Text className="text-muted-foreground mt-5 text-center text-[10px] leading-[16px]">
                © {new Date().getFullYear()} {siteConfig.author.nickname} · All
                rights reserved
              </Text>

              {/* System trust line (very subtle) */}

              <Text className="text-muted-foreground/40 mt-2 text-center text-[10px] leading-[16px]">
                Secure notification system · Powered by Resend
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
