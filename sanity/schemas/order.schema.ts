import { ORDER_STATUS_SANITY_LIST } from "@/constants/order";
import { LiaShoppingBasketSolid } from "react-icons/lia";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: LiaShoppingBasketSolid,
  fields: [
    defineField({
      name: "orderNumber",
      type: "string",
      readOnly: true,
      validation: (rule) => [rule.required().error("Order number is required")],
    }),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "quantity",
              type: "number",
              initialValue: 1,
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "priceAtPurchase",
              type: "number",
              description: "Price at time of purchase",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "product.name",
              quantity: "quantity",
              price: "priceAtPurchase",
              media: "product.images.0",
            },
            prepare({ title, quantity, price, media }) {
              return {
                title: title ?? "Product",
                subtitle: `Qty: ${quantity} • $${price}`,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "total",
      type: "number",
      readOnly: true,
      description: "Total order amount",
    }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "paid",
      options: {
        list: ORDER_STATUS_SANITY_LIST,
        layout: "radio",
      },
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      readOnly: true,
      description: "Clerk user ID",
    }),
    defineField({
      name: "email",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "address",
      type: "object",
      fields: [
        defineField({ name: "name", type: "string", title: "Full Name" }),
        defineField({ name: "line1", type: "string", title: "Address Line 1" }),
        defineField({ name: "line2", type: "string", title: "Address Line 2" }),
        defineField({ name: "city", type: "string" }),
        defineField({ name: "postcode", type: "string", title: "Postcode" }),
        defineField({ name: "country", type: "string" }),
      ],
    }),
    defineField({
      name: "paymentMethod",
      type: "string",
      options: {
        list: [
          { title: "Stripe", value: "stripe" },
          { title: "PayPal", value: "paypal" },
        ],
      },
    }),
    defineField({
      name: "paymentStatus",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Refunded", value: "refunded" },
          { title: "Failed", value: "failed" },
        ],
      },
    }),
    defineField({
      name: "stripePaymentId",
      type: "string",
      readOnly: true,
      description: "Stripe payment intent ID",
      hidden: ({ parent }) => parent?.paymentMethod !== "stripe",
    }),
    defineField({
      name: "stripeSessionId",
      type: "string",
      readOnly: true,
      description: "Stripe checkout session ID",
      hidden: ({ parent }) => parent?.paymentMethod !== "stripe",
    }),
    defineField({
      name: "paypalOrderId",
      type: "string",
      readOnly: true,
      description: "PayPal order ID",
      hidden: ({ parent }) => parent?.paymentMethod !== "paypal",
    }),
    defineField({
      name: "paidAt",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "emailSent",
      title: "Email Sent Status",
      type: "object",
      readOnly: true,
      fields: [
        defineField({
          name: "admin",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "customer",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      orderNumber: "orderNumber",
      email: "email",
      total: "total",
      status: "status",
    },
    prepare({ orderNumber, email, total, status }) {
      return {
        title: `Order ${orderNumber ?? "N/A"}`,
        subtitle: `${email ?? "No email"} • $${total ?? 0} • ${status ?? "paid"}`,
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});
