import { defineField, defineType } from "sanity";
import { TbLock } from "react-icons/tb";

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
      name: "startDateTime",
      title: "Start Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDateTime",
      title: "End Date & Time (optional)",
      type: "datetime",
      description:
        "If omitted, blocks only the exact start time. Add an end time to block a range.",
      validation: (Rule) =>
        Rule.custom((end, context) => {
          const parent = context.parent as
            | { startDateTime?: string }
            | undefined;
          if (
            end &&
            parent?.startDateTime &&
            new Date(end).getTime() <= new Date(parent.startDateTime).getTime()
          ) {
            return "End must be after start.";
          }
          return true;
        }),
    }),
    defineField({
      name: "message",
      title: "Custom Message",
      type: "text",
      description: "Displayed when a user tries to book within this window.",
    }),
  ],
  preview: {
    select: {
      start: "startDateTime",
      end: "endDateTime",
      consultation: "consultation.title",
    },
    prepare({ start, end, consultation }) {
      const range = end
        ? `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleString()}`
        : new Date(start).toLocaleString();
      return {
        title: `Blocked: ${range}`,
        subtitle: consultation || "All consultations",
      };
    },
  },
});
