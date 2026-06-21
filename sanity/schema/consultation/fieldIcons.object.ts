import { ReactIconsIconInput } from "@/sanity/components/ReactIconsIconInput";
import { defineField, defineType } from "sanity";

export const fieldIconsType = defineType({
  name: "fieldIcons",
  title: "Field Icons",
  type: "object",
  fields: [
    defineField({
      name: "start",
      title: "Start",
      type: "object",
      fields: [
        defineField({
          name: "icon",
          title: "Icon",
          type: "string",
          description: "Search for an icon name and select",
          components: {
            input: ReactIconsIconInput,
          },
        }),
        defineField({
          name: "value",
          title: "Value",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "end",
      title: "End",
      type: "object",
      fields: [
        defineField({
          name: "icon",
          title: "Icon",
          type: "string",
          description: "Search for an icon name and select",
          components: {
            input: ReactIconsIconInput,
          },
        }),
        defineField({
          name: "value",
          title: "Value",
          type: "string",
        }),
      ],
    }),
  ],
});
