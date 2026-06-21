import { defineField, defineType } from "sanity";
import { MdPanoramaWideAngle } from "react-icons/md";

export const consultationType = defineType({
  name: "consultation",
  title: "Consultation",
  type: "document",
  icon: MdPanoramaWideAngle,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The consultation name shown throughout the website.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in URLs. Example: bridal, prom, special-events.",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description:
        "Short marketing description displayed on the consultation page.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration (Minutes)",
      type: "number",
      description: "Length of the consultation session in minutes.",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description: "Consultation fee charged before booking.",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "dresses",
      title: "Maximum Dresses",
      type: "number",
      description:
        "Optional. Used only when consultation slug is exactly 'pre-made-dress-try-on'.",
    }),
    defineField({
      name: "image",
      title: "Banner Image",
      type: "image",
      description: "Main image displayed on the consultation page.",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "includes",
      title: "What's Included",
      type: "array",
      description: "List everything included in the consultation package.",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "formCards",
      title: "Form Sections",
      type: "array",
      description:
        "Each card represents a step or section within the booking form.",
      of: [{ type: "formCard" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls the display order on the pricing page",
    }),
    defineField({
      name: "onPMPage",
      title: "On Pre-made dresses page",
      description: "Should this consultation show in Pre-made Dresses page?",
      type: "boolean",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "image",
      subtitle: "price",
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: `$${subtitle}`,
      };
    },
  },
});
