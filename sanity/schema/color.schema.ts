import { defineField, defineType } from "sanity";
import { IoColorPaletteOutline } from "react-icons/io5";

export const colorType = defineType({
  name: "productColor",
  title: "Color",
  type: "document",
  icon: IoColorPaletteOutline,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      title: "Color",
      type: "color",
      options: {
        disableAlpha: true,
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "value.hex",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle || "No color selected",
        media: IoColorPaletteOutline,
      };
    },
  },
});
