import { defineField, defineType } from "sanity";

export const formCardType = defineType({
  name: "formCard",
  title: "Form Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "id",
      title: "ID",
      type: "slug",
      options: {
        source: "title",
      },
      description: "Unique identifier used by the frontend.",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "info",
      title: "Info Banner",
      type: "string",
      description: "Optional informational note displayed above the fields.",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "fields",
      title: "Fields",
      type: "array",
      of: [{ type: "formField" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "id",
    },
  },
});
