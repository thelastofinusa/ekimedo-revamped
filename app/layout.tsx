import type { Metadata } from "next";

import "./globals.css";
import { fontVariables } from "@/fonts";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  authors: [{ name: siteConfig.title }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    siteName: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  icons: [
    {
      url: "/assets/logo/charcoal.svg",
      media: "(prefers-color-scheme: light)",
    },
    {
      url: "/assets/logo/bone.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontVariables("antialiased")}>{props.children}</body>
    </html>
  );
}
