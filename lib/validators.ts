import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// Validate file size (max 3MB)
export const MAX_FILES_UPLOAD = 5;
export const MAX_SIZE_UPLOAD = 2 * 1024 * 1024; // 3MB

export const MIN_TEXTAREA_LENGTH = 10;
export const MAX_TEXTAREA_LENGTH = 500;

export const zSchema = {
  contact: z.object({
    fName: z
      .string("First name is required")
      .min(2, "At least 2 characters long")
      .max(50, "At least 50 characters long"),
    lName: z
      .string("Last name is required")
      .min(2, "At least 2 characters long")
      .max(50, "At least 50 characters long"),
    email: z.email("Email address is required").min(4, "Invalid email address"),
    inquiryType: z
      .string("Select an inquiry type")
      .min(1, "Select an inquiry type"),
    customField: z.string().optional(),
    phone: z
      .string("Phone number is required")
      .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
    message: z
      .string("Message is required")
      .min(
        MIN_TEXTAREA_LENGTH,
        `At least ${MIN_TEXTAREA_LENGTH} characters long`,
      )
      .max(
        MAX_TEXTAREA_LENGTH,
        `At least ${MAX_TEXTAREA_LENGTH} characters long`,
      ),
  }),
  inquiry: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z
      .email("Please enter a valid email address")
      .trim()
      .max(255, "Email must be less than 255 characters"),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
    eventType: z.string().min(1, "Please select an event type"),
    eventDate: z.date({
      error: "Please select an event date",
    }),
    budget: z.number({ message: "Estimated budget is required" }).int(),
    inspirationPhotos: z
      .array(z.instanceof(File))
      .min(1, "Please select at least one inspiration photo")
      .max(MAX_FILES_UPLOAD, `Please select up to ${MAX_FILES_UPLOAD} files`)
      .refine((files) => files.every((file) => file.size <= MAX_SIZE_UPLOAD), {
        message: `File size must be less than ${MAX_SIZE_UPLOAD / 1024 / 1024}MB`,
        path: ["files"],
      }),
    dreamDress: z
      .string()
      .trim()
      .min(20, "Please describe your dream dress in at least 20 characters")
      .max(2000, "Description must be less than 2000 characters"),
  }),
  review: z
    .object({
      review: z
        .string()
        .min(
          MIN_TEXTAREA_LENGTH,
          `Review must be at least ${MIN_TEXTAREA_LENGTH} characters.`,
        )
        .max(
          MAX_TEXTAREA_LENGTH,
          `Review must not exceed ${MAX_TEXTAREA_LENGTH} characters.`,
        ),
      rating: z
        .string("Please select a rating")
        .min(1, "Please select a rating"),
      service: z.string().min(1, "Please select a service."),
      customField: z.string().optional(),
      workAssets: z.array(z.file()).optional(),
    })
    .refine(
      (data) =>
        data.service !== "custom" ||
        (data.customField && data.customField.trim().length > 0),
      {
        path: ["customField"],
        message: "Please specify your custom service.",
      },
    ),
};

export type ZSchemaType = {
  [K in keyof typeof zSchema]: z.infer<(typeof zSchema)[K]>;
};
