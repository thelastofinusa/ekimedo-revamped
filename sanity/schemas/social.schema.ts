import { defineField, defineType } from "sanity";
import { BiLink } from "react-icons/bi";
import { ReactIcons } from "@/components/sanity/reactIcons";

export const socialType = defineType({
  name: "social",
  title: "Social Media Links",
  type: "document",
  icon: BiLink,
  fields: [
    defineField({
      name: "name",
      title: "Platform Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      type: "string",
      placeholder: "Search for icon..",
      components: {
        input: ReactIcons,
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "url",
    },
  },
});
