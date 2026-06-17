import Link from "next/link";
import { RiVisaLine } from "react-icons/ri";
import { FaApplePay, FaGooglePay, FaStripe } from "react-icons/fa";
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

import { Logo } from "./logo";
import { Container } from "./container";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
import { footerRoutes } from "@/constants/navigation";
import { Route } from "next";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { IconType } from "react-icons/lib";
import { client, clientOptions } from "@/sanity/lib/client";
import { SOCIAL_QUERY } from "@/sanity/queries/socials.query";

export const getSocialIcon = (name: string) => {
  switch (name) {
    case "instagram":
      return FaInstagram;
    case "facebook":
      return FaFacebookF;
    case "twitter":
      return;
    case "x":
      return FaXTwitter;
    case "linkedin":
      return FaLinkedin;
    case "tiktok":
      return FaTiktok;

    default:
      return FaLink;
  }
};

export const businessHours = {
  hours: [
    {
      _key: "monday",
      day: "Monday",
      isOpen: true,
      startTime: "09:00 AM",
      endTime: "18:00 PM",
    },
    {
      _key: "tuesday",
      day: "Tuesday",
      isOpen: true,
      startTime: "09:00 AM",
      endTime: "18:00 PM",
    },
    {
      _key: "wednesday",
      day: "Wednesday",
      isOpen: true,
      startTime: "09:00 AM",
      endTime: "18:00 PM",
    },
    {
      _key: "thursday",
      day: "Thursday",
      isOpen: true,
      startTime: "09:00 AM",
      endTime: "18:00 PM",
    },
    {
      _key: "friday",
      day: "Friday",
      isOpen: true,
      startTime: "09:00 AM",
      endTime: "18:00 PM",
    },
    {
      _key: "saturday",
      day: "Saturday",
      isOpen: true,
      startTime: "10:00 AM",
      endTime: "16:00 PM",
    },
    {
      _key: "sunday",
      day: "Sunday",
      isOpen: false,
      startTime: "",
      endTime: "",
    },
  ],
};

export const Footer = async () => {
  const socialHandles = await client.fetch(SOCIAL_QUERY, {}, clientOptions);

  // Utility to check if the day is "Today" for highlighting
  const isToday = (dayName: string) => {
    const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      new Date(),
    );
    return dayName.toLowerCase() === today.toLowerCase();
  };

  return (
    <footer className="bg-foreground text-background border-border/20 border-t">
      <Container
        size="sm"
        className="divide-border/20 flex flex-col divide-y py-24"
      >
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-16 pb-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-1">
            <Logo
              href="/"
              srcDesktop="horizontal"
              srcMobile="horizontal"
              mobileSize={[110, 32]}
              color="bone"
              className="block font-serif text-xl tracking-[0.2em] uppercase"
            />
            <p className="text-sm leading-relaxed font-light opacity-70">
              {siteConfig.description}
            </p>

            <div className="flex items-center gap-2">
              <Button variant={"outline"} size="xs" disabled>
                <FaStripe className="size-7" />
              </Button>
              <Button variant={"outline"} size="xs" disabled>
                <FaApplePay className="size-7" />
              </Button>
              <Button variant={"outline"} size="xs" disabled>
                <RiVisaLine className="size-6" />
              </Button>
              <Button variant={"outline"} size="xs" disabled>
                <FaGooglePay className="size-7" />
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              {socialHandles &&
                socialHandles.map((social) => {
                  const Icon = getSocialIcon(
                    social.name?.toLowerCase() || "",
                  ) as IconType;

                  return (
                    <Tooltip key={social._id}>
                      <TooltipTrigger>
                        <a
                          href={social.url || "#"}
                          target={social.url ? "_blank" : "_self"}
                          title={social.name || "Follow us"}
                          rel="noopener noreferrer"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-xs",
                            className: "group",
                          })}
                        >
                          <Icon className="text-background group-hover:text-foreground!" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent theme="light" align="start" side="bottom">
                        <p>{social.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
          </div>

          {footerRoutes.map((item) => (
            <div className="space-y-6" key={item.title}>
              <h4 className="text-muted-foreground font-sans text-xs font-medium tracking-widest uppercase">
                {item.title}
              </h4>
              <nav className="flex flex-col gap-4">
                {item.routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path as Route}
                    target={route.newTab ? "_blank" : "_parent"}
                    className="text-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {businessHours?.hours && businessHours.hours.length > 0 && (
          <div className="py-16">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
              {businessHours?.hours?.map((item) => {
                const active = isToday(item.day || "");

                return (
                  <div
                    key={item._key}
                    className={cn(
                      "relative flex flex-col gap-1 p-4 transition-all duration-500 last-of-type:col-span-2 lg:last-of-type:col-span-1",
                      {
                        "bg-green-500/10 shadow-sm ring-1 ring-green-500/20":
                          active,
                        "bg-red-500/15 shadow-xs ring-1 ring-red-500/25":
                          active && !item.isOpen,
                      },
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={cn(
                          "text-background text-[11px] font-medium tracking-widest uppercase",
                          {
                            "text-muted-foreground": !active,
                          },
                        )}
                      >
                        {item.day ? item.day : ""}
                      </span>

                      {active && (
                        <span className="relative flex size-2.5">
                          <span
                            className={cn(
                              "absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75",
                              {
                                "bg-red-500": !item.isOpen,
                              },
                            )}
                          />
                          <span
                            className={cn(
                              "relative inline-flex size-2.5 rounded-full bg-green-500",
                              {
                                "bg-red-500": !item.isOpen,
                              },
                            )}
                          />
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "text-background/80 mt-1 text-xs font-medium",
                        {
                          "text-red-400": !item.isOpen && active,
                          "text-green-500": item.isOpen && active,
                        },
                      )}
                    >
                      {item.isOpen
                        ? `${
                            item.startTime
                              ? item.startTime.replace(":00", "")
                              : ""
                          } to
                          ${item.endTime ? item.endTime.replace(":00", "") : ""}`
                        : active
                          ? "Not available today"
                          : "Unavailable"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Footer */}
        <div className="flex flex-col items-start justify-between gap-8 pt-16 text-xs tracking-widest md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="opacity-60">© 2025 {siteConfig.title}</p>
            <p>
              All Rights Reserved - Designed and Developed by{" "}
              <a
                target="_blank"
                href="http://x.com/thelastofinusa"
                className="font-medium underline"
              >
                Holiday
              </a>
            </p>
          </div>

          <div className="flex gap-4 md:text-right">
            <a href="tel:+12029074865" className="space-y-2">
              <p className="opacity-60">Phone Number</p>
              <p>(+1) 202-907-4865</p>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
