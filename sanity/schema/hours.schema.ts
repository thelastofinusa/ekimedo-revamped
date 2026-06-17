import { defineField, defineType } from "sanity";
import { RiTimerLine } from "react-icons/ri";

export const businessHoursType = defineType({
  name: "businessHours",
  title: "Business Hours",
  type: "document",
  icon: RiTimerLine,
  fields: [
    defineField({
      name: "hours",
      title: "Hours",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "day",
              title: "Day",
              type: "string",
              validation: (rule) => rule.required(),
              options: {
                list: [
                  { title: "Monday", value: "Monday" },
                  { title: "Tuesday", value: "Tuesday" },
                  { title: "Wednesday", value: "Wednesday" },
                  { title: "Thursday", value: "Thursday" },
                  { title: "Friday", value: "Friday" },
                  { title: "Saturday", value: "Saturday" },
                  { title: "Sunday", value: "Sunday" },
                ],
              },
            }),

            defineField({
              name: "isOpen",
              title: "Open?",
              type: "boolean",
              initialValue: true,
            }),

            defineField({
              name: "startTime",
              title: "Start Time",
              type: "string",
              hidden: ({ parent }) => parent?.isOpen === false,
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { isOpen?: boolean } | undefined;
                  if (parent?.isOpen && !value) {
                    return "Start time is required when open";
                  }
                  return true;
                }),
            }),

            defineField({
              name: "endTime",
              title: "End Time",
              type: "string",
              hidden: ({ parent }) => parent?.isOpen === false,
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { isOpen?: boolean } | undefined;
                  if (parent?.isOpen && !value) {
                    return "End time is required when open";
                  }
                  return true;
                }),
            }),
          ],
          preview: {
            select: {
              day: "day",
              isOpen: "isOpen",
              startTime: "startTime",
              endTime: "endTime",
            },
            prepare({ day, isOpen, startTime, endTime }) {
              return {
                title: day,
                subtitle: isOpen
                  ? `${startTime || "—"} – ${endTime || "—"}`
                  : "Closed",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Business Hours",
      };
    },
  },
});
