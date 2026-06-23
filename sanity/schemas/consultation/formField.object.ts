import { defineField, defineType } from "sanity";

export const formFieldType = defineType({
  name: "formField",
  title: "Form Field",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Field Name",
      type: "string",
      description: "Unique form key used during submission.",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "type",
      title: "Field Type",
      type: "string",
      options: {
        list: [
          "text",
          "email",
          "tel",
          "number",
          "date",
          "datetime-local",
          "textarea",
          "select",
          "checkbox",
          "radio",
          "file",
          "size",
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "placeholder",
      title: "Placeholder",
      type: "string",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "fieldDescription",
      description: "Optional helper text or frontend link.",
    }),

    defineField({
      name: "required",
      title: "Required",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "errMsg",
      title: "Validation Error Message",
      type: "string",
    }),

    defineField({
      name: "group",
      title: "Group",
      type: "string",
      description: "Frontend layout grouping (first, second, third, etc).",
    }),

    defineField({
      name: "defaultValue",
      title: "Default Value",
      type: "string",
    }),

    defineField({
      name: "icons",
      title: "Icons",
      type: "fieldIcons",
    }),

    defineField({
      name: "options",
      title: "Options",
      type: "array",
      description: "Used for select, radio, checkbox and similar fields.",
      of: [{ type: "fieldOption" }],
    }),

    defineField({
      name: "items",
      title: "Items",
      type: "array",
      description: "Used for pricing tiers and budget selections.",
      of: [{ type: "fieldItem" }],
    }),

    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],

  preview: {
    select: {
      title: "label",
      subtitle: "type",
    },
  },
});
