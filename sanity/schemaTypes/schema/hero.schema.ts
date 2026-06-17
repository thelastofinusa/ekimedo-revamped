import { defineField, defineType } from "sanity";
import { BiImage } from "react-icons/bi";

export const heroType = defineType({
  name: "hero",
  title: "Hero Images",
  type: "document",
  icon: BiImage,
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "alt",
      media: "image",
    },
  },
});
