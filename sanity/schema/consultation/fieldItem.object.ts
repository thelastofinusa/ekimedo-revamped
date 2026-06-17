import { defineField, defineType } from "sanity";

export const fieldItemType = defineType({
  name: "fieldItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
    }),

    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    defineField({
      name: "range",
      title: "Price Range",
      type: "fieldRange",
    }),
  ],
});
