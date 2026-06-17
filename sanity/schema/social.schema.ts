import { defineField, defineType } from "sanity";
import { BiLink } from "react-icons/bi";
import { ReactIconsIconInput } from "../components/ReactIconsIconInput";

export const socialType = defineType({
  name: "social",
  title: "Social Handles",
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
        input: ReactIconsIconInput,
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
