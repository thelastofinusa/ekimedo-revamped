import { defineField, defineType } from "sanity";

export const fieldRangeType = defineType({
  name: "fieldRange",
  title: "Range",
  type: "object",
  fields: [
    defineField({
      name: "from",
      title: "From",
      type: "number",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "to",
      title: "To",
      type: "number",
    }),
  ],
});
