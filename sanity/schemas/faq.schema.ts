import { defineField, defineType } from "sanity";
import { TbMessageQuestion } from "react-icons/tb";

export const faqType = defineType({
  name: "faq",
  title: "Frequently Asked Questions",
  type: "document",
  icon: TbMessageQuestion,
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "question",
      subtitle: "answer",
    },
  },
});
