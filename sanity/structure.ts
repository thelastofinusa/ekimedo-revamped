import { siteConfig } from "@/config/site.config";
import type { StructureResolver } from "sanity/structure";
import { SlSettings } from "react-icons/sl";
import {
  BsCalendar2Minus,
  BsCart3,
  BsChatSquareDots,
  BsCollection,
} from "react-icons/bs";

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
              S.documentTypeListItem("consultation").title("Consultations"),
              S.documentTypeListItem("booking").title("Bookings"),
              S.documentTypeListItem("inquiry").title("Custom Enquiry"),
              S.divider(),
              S.documentTypeListItem("blockedSlot").title(
                "Blocked Dates & Time Slots",
              ),
            ]),
        ),

      // ==================================================
      // PRODUCTS & ORDERS
      // ==================================================
      S.listItem()
        .title("Products & Orders")
        .icon(BsCart3)
        .child(
          S.list()
            .title("Products & Orders")
            .items([
              S.documentTypeListItem("product").title("Products"),
              S.documentTypeListItem("category").title("Categories"),
              S.documentTypeListItem("productColor").title("Colors"),
              S.divider(),
              S.documentTypeListItem("order").title("Orders"),
            ]),
        ),

      // ==================================================
      // GALLERY
      // ==================================================
      S.listItem()
        .title("Gallery")
        .icon(BsCollection)
        .child(
          S.list()
            .title("Gallery")
            .items([
              S.listItem()
                .title("All Photos")
                .child(
                  S.documentTypeList("gallery").title("All Gallery Photos"),
                ),

              S.divider(),

              S.listItem()
                .title("Bridal Collection")
                .child(
                  S.documentList()
                    .title("Bridal Collection")
                    .filter(
                      `_type == "gallery" && category->slug.current == "bridal-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Prom Collection")
                .child(
                  S.documentList()
                    .title("Prom Collection")
                    .filter(
                      `_type == "gallery" && category->slug.current == "prom-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Special Events Collection")
                .child(
                  S.documentList()
                    .title("Special Events Collection")
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
              S.documentTypeListItem("hero").title("Hero Slides"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("social").title("Social Media Links"),
              S.documentTypeListItem("faq").title("Frequently Asked Questions"),
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
              S.documentTypeListItem("pricingTier").title("Pricing"),
              S.documentTypeListItem("businessHours").title("Business Hours"),
              S.documentTypeListItem("cancellationPolicy").title(
                "Cancellation Policy",
              ),
              S.documentTypeListItem("permissions").title("Admin Permissions"),
            ]),
        ),
    ]);
