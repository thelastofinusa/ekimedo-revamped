import { defineField, defineType } from "sanity";
import { MailQuestion } from "lucide-react";
import { EVENT_TYPES } from "@/constants/others";

export const inquiryType = defineType({
  name: "inquiry",
  title: "Client's Enquiry",
  type: "document",
  icon: MailQuestion,
  fields: [
    defineField({
      name: "fullName",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      options: {
        list: EVENT_TYPES,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eventDate",
      title: "Event Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "budget",
      title: "Budget",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dreamDress",
      title: "Dream Dress Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
        ],
      },
    }),
    defineField({
      name: "inspirationPhotos",
      title: "Inspiration Photos",
      type: "array",
      of: [{ type: "image", name: "asset", options: { hotspot: true } }],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: "fullName",
      subtitle: "eventType",
      media: "inspirationPhotos.0",
    },
  },
});
