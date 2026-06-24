import { siteConfig } from "@/config/site.config";
import type { StructureResolver } from "sanity/structure";
import { SlSettings } from "react-icons/sl";
import {
  BsCalendar2Minus,
  BsChatSquareDots,
  BsCollectionPlay,
  BsDuffle,
} from "react-icons/bs";
import { RiTimerLine } from "react-icons/ri";
import { apiVersion } from "./env";

export const structure: StructureResolver = (S) =>
  S.list()
    .title(siteConfig.title)
    .items([
      // ==================================================
      // CONSULTATIONS & BOOKINGS
      // ==================================================

      S.listItem()
        .title("Consultations & Bookings")
        .icon(BsCalendar2Minus)
        .child(
          S.list()
            .title("Consultations & Bookings")
            .items([
              S.documentTypeListItem("consultation"),
              S.documentTypeListItem("inquiry"),
              S.documentTypeListItem("booking"),
              S.divider(),
              S.documentTypeListItem("blockedSlot"),
            ]),
        ),

      // ==================================================
      // PRODUCTS & ORDERS
      // ==================================================
      S.listItem()
        .title("Products & Orders")
        .icon(BsDuffle)
        .child(
          S.list()
            .title("Products & Orders")
            .items([
              S.documentTypeListItem("product"),
              S.documentTypeListItem("category"),
              S.documentTypeListItem("productColor"),
              S.divider(),
              S.documentTypeListItem("order"),
            ]),
        ),

      // ==================================================
      // GALLERY
      // ==================================================
      S.listItem()
        .title("All Gallery Photos")
        .icon(BsCollectionPlay)
        .child(
          S.list()
            .title("Gallery")
            .items([
              S.listItem()
                .title("All Photos")
                .child(S.documentTypeList("gallery")),

              S.divider(),

              S.listItem()
                .title("Bridal Collection")
                .child(
                  S.documentList()
                    .title("Bridal Collection")
                    .apiVersion(apiVersion)
                    .filter(
                      `_type == "gallery" && category->slug.current == "bridal-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Prom Collection")
                .child(
                  S.documentList()
                    .title("Prom Collection")
                    .apiVersion(apiVersion)
                    .filter(
                      `_type == "gallery" && category->slug.current == "prom-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Special Events Collection")
                .child(
                  S.documentList()
                    .title("Special Events Collection")
                    .apiVersion(apiVersion)
                    .filter(
                      `_type == "gallery" && category->slug.current == "special-events"`,
                    ),
                ),

              S.divider(),

              S.listItem()
                .title("Featured Photos")
                .child(
                  S.documentList()
                    .title("Featured Photos")
                    .apiVersion(apiVersion)
                    .filter(`_type == "gallery" && featured == true`),
                ),
            ]),
        ),

      // ==================================================
      // WEBSITE CONTENT
      // ==================================================
      S.listItem()
        .title("Website Content")
        .icon(BsChatSquareDots)
        .child(
          S.list()
            .title("Website Content")
            .items([
              S.documentTypeListItem("hero"),
              S.documentTypeListItem("testimonial"),
              S.documentTypeListItem("social"),
              S.documentTypeListItem("faq"),
              S.documentTypeListItem("bookingProcess"),
            ]),
        ),

      // ==================================================
      // BUSINESS SETTINGS
      // ==================================================
      S.listItem()
        .title("Business Settings")
        .icon(SlSettings)
        .child(
          S.list()
            .title("Business Settings")
            .items([
              S.documentTypeListItem("pricingTier"),
              S.documentTypeListItem("cancellationPolicy"),
              S.documentTypeListItem("permission"),
              S.divider(),
              S.listItem()
                .title("Business Hours")
                .icon(RiTimerLine)
                .child(
                  S.document()
                    .schemaType("businessHours")
                    .documentId("businessHours"),
                ),
            ]),
        ),
    ]);
