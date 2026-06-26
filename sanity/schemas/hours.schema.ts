import { defineField, defineType } from "sanity";
import { RiTimerLine } from "react-icons/ri";
import { TimeInput } from "@/components/sanity/timeInput";

export const businessHoursType = defineType({
  name: "businessHours",
  title: "Business Hours",
  type: "document",
  icon: RiTimerLine,

  initialValue: {
    hours: [
      { day: "Monday", isOpen: true },
      { day: "Tuesday", isOpen: true },
      { day: "Wednesday", isOpen: true },
      { day: "Thursday", isOpen: true },
      { day: "Friday", isOpen: true },
      { day: "Saturday", isOpen: true },
      { day: "Sunday", isOpen: true },
    ],
  },

  fields: [
    defineField({
      name: "hours",
      title: "Hours",
      type: "array",
      validation: (rule) => rule.required().min(7).max(7),

      of: [
        {
          type: "object",

          fields: [
            defineField({
              name: "day",
              title: "Day",
              type: "string",
              readOnly: true,
              validation: (rule) => rule.required(),
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
              components: {
                input: TimeInput,
              },
              hidden: ({ parent }) => parent?.isOpen === false,
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as
                    | { isOpen?: boolean }
                    | undefined;

                  if (parent?.isOpen && !value) {
                    return "Start time is required when open";
                  }

                  if (
                    value &&
                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
                  ) {
                    return 'Must be in HH:mm format (e.g. "09:00")';
                  }

                  return true;
                }),
            }),

            defineField({
              name: "endTime",
              title: "End Time",
              type: "string",
              components: {
                input: TimeInput,
              },
              hidden: ({ parent }) => parent?.isOpen === false,
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as
                    | { isOpen?: boolean; startTime?: string }
                    | undefined;

                  if (parent?.isOpen && !value) {
                    return "End time is required when open";
                  }

                  if (
                    value &&
                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
                  ) {
                    return 'Must be in HH:mm format (e.g. "17:00")';
                  }

                  if (
                    parent?.isOpen &&
                    parent.startTime &&
                    value &&
                    value <= parent.startTime
                  ) {
                    return "End time must be after start time";
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
