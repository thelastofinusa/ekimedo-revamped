import { defineField, defineType } from "sanity";
import { TbCurrencyDollar } from "react-icons/tb";

export const pricingTierType = defineType({
  name: "pricingTier",
  title: "Pricing Tiers",
  type: "document",
  icon: TbCurrencyDollar,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Starting Price",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.min(1),
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
      title: "name",
      subtitle: "description",
    },
  },
});
