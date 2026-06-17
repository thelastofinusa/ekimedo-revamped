import { siteConfig } from "@/config/site.config";
import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title(siteConfig.title)
    .items([
      // Shop
      S.documentTypeListItem("category"), // ✅

      S.divider(),

      // Content
      S.documentTypeListItem("hero"), // ✅
      S.listItem()
        .title("Gallery")
        .child(
          S.list()
            .title("Gallery")
            .items([
              S.listItem()
                .title("All")
                .child(S.documentTypeList("gallery").title("All Galleries")),

              S.divider(),

              S.listItem()
                .title("Bridal Dresses")
                .child(
                  S.documentList()
                    .title("Bridal Dresses")
                    .filter(
                      `_type == "gallery" && category->slug.current == "bridal-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Prom Dresses")
                .child(
                  S.documentList()
                    .title("Prom Dresses")
                    .filter(
                      `_type == "gallery" && category->slug.current == "prom-dresses"`,
                    ),
                ),

              S.listItem()
                .title("Special Events")
                .child(
                  S.documentList()
                    .title("Special Events")
                    .filter(
                      `_type == "gallery" && category->slug.current == "special-events"`,
                    ),
                ),

              S.divider(),

              S.listItem()
                .title("Featured")
                .child(
                  S.documentList()
                    .title("Featured Galleries")
                    .filter(`_type == "gallery" && featured == true`),
                ),
            ]),
        ),
      S.documentTypeListItem("testimonial"), // ✅
      S.documentTypeListItem("social"), // ✅

      S.divider(),
      // Settings
      S.documentTypeListItem("pricingTier"), // ✅
      S.documentTypeListItem("cancellationPolicy"), // ✅
      S.documentTypeListItem("businessHours"), // ✅
      S.documentTypeListItem("faq"), // ✅
      S.documentTypeListItem("permissions"), // ✅
    ]);
