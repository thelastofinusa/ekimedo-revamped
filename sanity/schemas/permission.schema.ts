import { defineField, defineType } from "sanity";
import { IoShieldHalf } from "react-icons/io5";

export const permissionType = defineType({
  name: "permission",
  title: "Review Permission",
  type: "document",
  icon: IoShieldHalf,
  fields: [
    defineField({
      name: "customerName",
      title: "Customer's Name",
      type: "string",
      validation: (rule) => rule.required().error("Client name is required"),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer's Email",
      type: "email",
      description: "Grant customer the permission to write a review",
      validation: (rule) => rule.required().error("Client email is required"),
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      email: "customerEmail",
    },
    prepare({ name, email }) {
      return {
        title: email,
        subtitle: `Permission granted to ${name ?? email}`,
      };
    },
  },
});
