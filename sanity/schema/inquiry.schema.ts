import { defineField, defineType } from "sanity";
import { MailQuestion } from "lucide-react";

export const inquiryType = defineType({
  name: "inquiry",
  title: "Inquiry",
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
        list: [
          { title: "Wedding", value: "wedding" },
          { title: "Prom", value: "prom" },
          { title: "Reception", value: "reception" },
          { title: "Special Occasion", value: "special-occasion" },
        ],
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
      name: "inspirationPhotos",
      title: "Inspiration Photos",
      type: "array",
      of: [{ type: "image" }],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "In Progress", value: "in-progress" },
          { title: "Completed", value: "completed" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "new",
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
