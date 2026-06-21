import { defineField, defineType } from "sanity";
import { HiMiniCalendarDays } from "react-icons/hi2";

export const bookingType = defineType({
  name: "booking",
  title: "Booked Consultations",
  type: "document",
  icon: HiMiniCalendarDays,
  fields: [
    defineField({
      name: "consultation",
      title: "Consultation",
      type: "reference",
      to: [{ type: "consultation" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dateTime",
      title: "Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Stripe", value: "stripe" },
          { title: "PayPal", value: "paypal" },
        ],
      },
    }),
    defineField({
      name: "stripeSessionId",
      title: "Stripe Session ID",
      type: "string",
      hidden: ({ parent }) => parent?.paymentMethod !== "stripe",
    }),
    defineField({
      name: "paypalOrderId",
      title: "PayPal Order ID",
      type: "string",
      hidden: ({ parent }) => parent?.paymentMethod !== "paypal",
    }),
    defineField({
      name: "formFields",
      title: "Submitted Answers",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          name: "formFieldAnswer",
          fields: [
            { name: "fieldName", type: "string", readOnly: true },
            { name: "fieldLabel", type: "string", readOnly: true },
            { name: "fieldType", type: "string", readOnly: true },
            { name: "value", type: "text", readOnly: true },
            {
              name: "files",
              title: "Uploaded Images",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
              hidden: ({ parent }) => parent?.fieldType !== "file",
            },
          ],
          preview: {
            select: {
              title: "fieldLabel",
              subtitle: "value",
              media: "files.0",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "consultation.title",
      date: "dateTime",
      status: "status",
    },
    prepare({ title, subtitle, date, status }) {
      return {
        title: title || "Booking",
        subtitle: `${subtitle || ""} — ${new Date(date).toLocaleString()}`,
        description: `Status: ${status || "pending"}`,
      };
    },
  },
});
