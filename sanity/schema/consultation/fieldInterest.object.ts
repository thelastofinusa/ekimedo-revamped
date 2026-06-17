import { defineField, defineType } from "sanity";

export const fieldInterestType = defineType({
  name: "fieldInterest",
  title: "Interest",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
    }),

    defineField({
      name: "label",
      title: "Label",
      type: "string",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
  ],
});
