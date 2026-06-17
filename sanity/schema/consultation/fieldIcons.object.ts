import { ReactIconsIconInput } from "@/sanity/components/ReactIconsIconInput";
import { defineField, defineType } from "sanity";

export const fieldIconsType = defineType({
  name: "fieldIcons",
  title: "Field Icons",
  type: "object",
  fields: [
    defineField({
      name: "start",
      title: "Start Icon",
      type: "string",
      description: "React Icon or Lucide icon name.",
      components: {
        input: ReactIconsIconInput,
      },
    }),

    defineField({
      name: "end",
      title: "End Value",
      type: "string",
      components: {
        input: ReactIconsIconInput,
      },
    }),
  ],
});
