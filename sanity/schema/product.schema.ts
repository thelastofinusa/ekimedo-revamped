import { defineField, defineType } from "sanity";
import { PiDress } from "react-icons/pi";
import { formatPrice } from "@/lib/format";

export const productType = defineType({
  name: "product",
  title: "Pre-made Dresses",
  type: "document",
  icon: PiDress,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().error("Product name is required"),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required().error("Slug is required"),
    }),

    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description: "Example 599.99",
      validation: (rule) =>
        rule.required().min(0).error("Price must be positive"),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required().error("Description is required"),
    }),

    defineField({
      name: "delivery",
      title: "Delivery Information",
      type: "text",
      rows: 3,
      description:
        "Default: Estimated delivery: 4-6 weeks. Complementary alteration is included.",
    }),

    defineField({
      name: "snapshots",
      title: "Snapshots",
      type: "array",
      of: [
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
        },
        {
          type: "file",
          title: "Video",
          options: {
            accept: "video/*", // only accept video files
          },
        },
      ],
      validation: (rule) =>
        rule
          .min(1)
          .error("At least one snapshot is required")
          .max(6)
          .error("A maximum of 6 snapshots"),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required().error("Category is required"),
    }),

    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "0-2 (XS)", value: "0-2 (XS)" },
          { title: "4-6 (S)", value: "4-6 (S)" },
          { title: "8-10 (M)", value: "8-10 (M)" },
          { title: "12-14 (L)", value: "12-14 (L)" },
          { title: "16-18 (XL)", value: "16-18 (XL)" },
        ],
      },
    }),

    defineField({
      name: "colors",
      title: "Colors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "productColor" }] }],
    }),

    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      initialValue: 0,
      validation: (rule) =>
        rule.integer().min(0).error("Stock must be 0 or higher"),
    }),
  ],
  preview: {
    select: {
      name: "name",
      price: "price",
      stock: "stock",
    },
    prepare({ name, price, stock }) {
      return {
        title: name,
        subtitle: `${formatPrice(price)} - ${stock} in stock`,
      };
    },
  },
});
