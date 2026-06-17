import { defineField, defineType } from "sanity";
import { LuGalleryVerticalEnd } from "react-icons/lu";

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  icon: LuGalleryVerticalEnd,
  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "category.name",
      featured: "featured",
      media: "image",
    },
    prepare({ title, featured, media }) {
      return {
        title,
        subtitle: `Featured: ${featured ? "Yes" : "No"}`,
        media,
      };
    },
  },
});
