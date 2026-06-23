import { defineField, defineType } from "sanity";

export const fieldDescriptionType = defineType({
  name: "fieldDescription",
  title: "Field Description",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Text",
      type: "string",
    }),

    defineField({
      name: "path",
      title: "Link Path",
      type: "string",
    }),

    defineField({
      name: "newTab",
      title: "Open In New Tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
