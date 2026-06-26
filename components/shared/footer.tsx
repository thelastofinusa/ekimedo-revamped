"use client";
import React from "react";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Logo } from "./logo";
import { buttonVariants } from "../shadcn/button";
import { resolveIcon } from "@/lib/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { footerRoutes } from "@/constants/navigation";
import Link from "next/link";
import { Route } from "next";
import {
  QUERY_BUSINESS_HOURS_RESULT,
  QUERY_SOCIAL_HANDLES_RESULT,
} from "@/sanity.types";
import { getEasternDay, getEasternNow } from "@/lib/time";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const now = getEasternNow();
const isToday = (day: string) => getEasternDay(now) === day;

// Helper to format "HH:mm" to "h:mm AM/PM"
function formatTimeTo12Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function isCurrentlyOpen(
  startTime?: string,
  endTime?: string,
  isOpen?: boolean,
  nowDate?: Date,
) {
  if (!isOpen || !startTime || !endTime || !nowDate) return false;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export const Footer: React.FC<{
  initialHours: QUERY_BUSINESS_HOURS_RESULT;
  socialHandles: QUERY_SOCIAL_HANDLES_RESULT;
}> = ({ initialHours, socialHandles }) => {
  const sortedHours =
    initialHours?.hours?.sort(
      (a, b) => DAYS.indexOf(a.day as string) - DAYS.indexOf(b.day as string),
    ) ?? [];

  const todayHours = sortedHours.find((item) => isToday(item.day || ""));

  const openNow = todayHours
    ? isCurrentlyOpen(
        todayHours.startTime as string,
        todayHours.endTime as string,
        todayHours.isOpen as boolean,
        now,
      )
    : false;

  const status = !todayHours?.isOpen
    ? {
        label: "Closed Today",
        className: "bg-red-500/10 text-red-400 ring-red-500/20",
      }
    : openNow
      ? {
          label: "Open Now",
          className: "bg-green-500/10 text-green-400 ring-green-500/20",
        }
      : {
          label: "Currently Closed",
          className: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
        };

  return (
    <footer className="bg-foreground text-background border-border/20 border-t">
      <Container
        size="sm"
        className="divide-border/20 flex flex-col divide-y py-24"
      >
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-16 pb-16 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-2 max-w-xs">
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

            <div className="flex items-center gap-2.5">
              {socialHandles &&
                socialHandles.map((social) => {
                  const Icon = resolveIcon(social.icon);

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
                          {Icon && (
                            <Icon className="text-background group-hover:text-foreground!" />
                          )}
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

        {sortedHours && sortedHours.length > 0 && (
          <div className="gap-6 flex flex-col py-16">
            <div
              className={cn(
                "inline-flex items-center gap-2 w-max rounded-full px-3 py-1 text-xs font-medium ring-1",
                status.className,
              )}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-current" />
              </span>

              {status.label}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              {sortedHours?.map((item) => {
                const active = isToday(item.day || "");

                const openNow = active
                  ? isCurrentlyOpen(
                      item.startTime as string,
                      item.endTime as string,
                      item.isOpen as boolean,
                      now,
                    )
                  : false;

                const closedForDay = active && !item.isOpen;
                const opensLaterOrClosedNow = active && item.isOpen && !openNow;

                return (
                  <div
                    key={item._key}
                    className={cn(
                      "relative flex flex-col gap-1 p-4 transition-all duration-500 last-of-type:col-span-2 lg:last-of-type:col-span-1",
                      {
                        "bg-green-500/10 shadow-sm ring-1 ring-green-500/20":
                          active && openNow,

                        "bg-amber-500/10 shadow-sm ring-1 ring-amber-500/20":
                          opensLaterOrClosedNow,

                        "bg-red-500/15 shadow-xs ring-1 ring-red-500/25":
                          closedForDay,
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
                              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                              {
                                "bg-green-500": openNow,
                                "bg-amber-500": opensLaterOrClosedNow,
                                "bg-red-500": closedForDay,
                              },
                            )}
                          />
                          <span
                            className={cn(
                              "relative inline-flex size-2.5 rounded-full",
                              {
                                "bg-green-500": openNow,
                                "bg-amber-500": opensLaterOrClosedNow,
                                "bg-red-500": closedForDay,
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
                          "text-green-500": active && openNow,
                          "text-amber-400": opensLaterOrClosedNow,
                          "text-red-400": closedForDay,
                        },
                      )}
                    >
                      {closedForDay
                        ? "Not available today"
                        : item.isOpen
                          ? `${formatTimeTo12Hour(item.startTime)} – ${formatTimeTo12Hour(item.endTime)}`
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
