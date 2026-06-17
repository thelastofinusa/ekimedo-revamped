import { defineField, defineType } from "sanity";

export const fieldOptionType = defineType({
  name: "fieldOption",
  title: "Field Option",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    defineField({
      name: "interests",
      title: "Nested Interests",
      type: "array",
      of: [{ type: "fieldInterest" }],
    }),
  ],
});
