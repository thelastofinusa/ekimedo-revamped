import { defineField, defineType } from "sanity";
import { IoFootstepsOutline } from "react-icons/io5";
import { ReactIcons } from "@/components/sanity/reactIcons";

export const bookingProcessType = defineType({
  name: "bookingProcess",
  title: "Booking Process",
  type: "document",
  icon: IoFootstepsOutline,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      placeholder: "Search for icon..",
      components: {
        input: ReactIcons,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls the display order on the pricing page",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
