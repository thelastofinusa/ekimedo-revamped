import { defineField, defineType } from "sanity";
import { IoShieldHalf } from "react-icons/io5";

export const permissionType = defineType({
  name: "permissions",
  title: "Review Permission",
  type: "document",
  icon: IoShieldHalf,
  fields: [
    defineField({
      name: "customerName",
      title: "Customer's Name",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer's Email",
      type: "email",
      description: "Grant customer the permission to write a review",
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      email: "customerEmail",
    },
    prepare({ name, email }) {
      return {
        title: name ?? email,
        subtitle: `Permission granted to ${email}`,
      };
    },
  },
});
