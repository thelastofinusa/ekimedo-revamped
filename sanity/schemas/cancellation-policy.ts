import { defineField, defineType } from "sanity";
import { AiOutlineAlert } from "react-icons/ai";
import { ReactIcons } from "@/components/sanity/reactIcons";

export const cancellationPolicyType = defineType({
  name: "cancellationPolicy",
  title: "Cancellation Policy",
  type: "document",
  icon: AiOutlineAlert,
  fields: [
    defineField({
      name: "title",
      title: "Policy Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Policy Description",
      type: "text",
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
});
