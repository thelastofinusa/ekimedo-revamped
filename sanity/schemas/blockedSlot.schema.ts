import { defineField, defineType } from "sanity";
import { TbLock } from "react-icons/tb";
import { TimeInput } from "@/components/sanity/timeInput";

export const blockedSlotType = defineType({
  name: "blockedSlot",
  title: "Blocked Slot",
  type: "document",
  icon: TbLock,
  fields: [
    defineField({
      name: "consultation",
      title: "Consultation (optional)",
      type: "reference",
      to: [{ type: "consultation" }],
      description: "Leave empty to block for all consultation types.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "allDay",
      title: "All Day",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "startTime",
      title: "Start Time",
      type: "string",
      components: {
        input: TimeInput,
      },
      hidden: ({ parent }) => parent?.allDay === true,
      description: "Format: HH:mm (24-hour)",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { allDay?: boolean } | undefined;
          if (parent?.allDay) return true;
          if (!value) return "Start time is required when not all-day.";
          if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return 'Must be in HH:mm format (e.g., "09:00")';
          }
          return true;
        }),
    }),
    defineField({
      name: "duration",
      title: "Duration (Minutes) – for global blocks only",
      type: "number",
      hidden: ({ parent }) => parent?.allDay === true || !!parent?.consultation,
      description:
        "Used when no consultation is selected. Leave empty to use a default of 60 minutes.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | { allDay?: boolean; consultation?: any }
            | undefined;
          if (parent?.allDay) return true;
          if (parent?.consultation) return true; // duration comes from consultation
          // Allow empty (server will default to 60)
          if (value !== undefined && value !== null && value <= 0) {
            return "Duration must be positive.";
          }
          return true;
        }),
    }),
    defineField({
      name: "message",
      title: "Custom Message",
      type: "text",
      description: "Optional message to display when this slot is blocked.",
    }),
  ],
  preview: {
    select: {
      title: "date",
      subtitle: "consultation.title",
    },
    prepare({ title, subtitle }) {
      return {
        title: `Blocked: ${title}`,
        subtitle: subtitle || "All consultations",
      };
    },
  },
});
