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
import { getSocialIconUrl } from "@/lib/icons";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import React from "react";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
  title: string; // URL of the header logo
  socialHandles?: QUERY_SOCIAL_HANDLES_RESULT;
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
                <Link
                  href={siteConfig.url}
                  className="text-muted-foreground underline"
                >
                  {siteConfig.title}
                </Link>{" "}
                - {siteConfig.tagline}
              </Text>

              {/* Socials – using table for reliable centering */}
              <table
                align="center"
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{ textAlign: "center" }}
              >
                <tr>
                  <td align="center" style={{ textAlign: "center" }}>
                    <table
                      align="center"
                      cellPadding="0"
                      cellSpacing="0"
                      role="presentation"
                    >
                      <tr>
                        {socialHandles?.map((social) => {
                          const iconUrl = getSocialIconUrl(social.name || "");
                          return (
                            <td key={social._id} style={{ padding: "0 8px" }}>
                              <a
                                href={social.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: "#6b7280",
                                  textDecoration: "none",
                                }}
                              >
                                {iconUrl ? (
                                  <Img
                                    src={iconUrl}
                                    alt={social.name || "Social icon"}
                                    width="14"
                                    height="14"
                                    style={{ opacity: 0.5, marginTop: "2px" }}
                                  />
                                ) : (
                                  <span style={{ fontSize: "16px" }}>🔗</span>
                                )}
                                <span className="text-sm ml-1">
                                  {social.name}
                                </span>
                              </a>
                            </td>
                          );
                        })}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Divider (subtle separation) */}
              <Hr className="my-6 border-[#f3f4f6]" />

              {/* Legal (compressed) */}

              <Text className="text-muted-foreground mt-5 text-center text-[11px] leading-[18px]">
                Need help?{" "}
                <Link
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="text-primary underline"
                >
                  {siteConfig.supportEmail}
                </Link>
              </Text>

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
