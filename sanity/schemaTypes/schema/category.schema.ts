import { defineField, defineType } from "sanity";
import { BiCategoryAlt } from "react-icons/bi";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: BiCategoryAlt,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
