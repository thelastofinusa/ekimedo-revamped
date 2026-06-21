import { Consultation, FormField } from "@/sanity.types";
import { format } from "date-fns";
import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

const fieldToZod = (field: FormField) => {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
    case "size":
    case "textarea":
    case "select":
      schema = field.required
        ? z
            .string({
              error: field.errMsg ?? "This field is required",
            })
            .min(1, field.errMsg)
        : z.string();
      break;

    case "tel": {
      const phoneValidator = z
        .string()
        .trim()
        .refine(isValidPhoneNumber, {
          message: field.errMsg ?? "Invalid phone number",
        });
      if (field.required) {
        schema = z
          .string({ error: field.errMsg ?? "This field is required" })
          .refine(isValidPhoneNumber, {
            message: field.errMsg ?? "Invalid phone number",
          });
      } else {
        schema = phoneValidator.or(z.literal("")).optional();
      }
      break;
    }

    case "email":
      if (field.required) {
        schema = z.email(field.errMsg ?? "Invalid email address");
      } else {
        schema = z.email("Invalid email address").or(z.literal("")).optional();
      }
      break;

    case "number":
      schema = z.coerce.number();
      break;

    case "date":
    case "datetime-local":
      if (field.required) {
        schema = z.string().min(1, field.errMsg ?? "Please select a date");
      } else {
        schema = z.string().optional().nullable();
      }
      break;

    case "checkbox":
      schema = z.array(z.string());
      if (field.required) {
        schema = (schema as z.ZodArray<z.ZodString>).min(1, field.errMsg);
      }
      break;
    case "file": {
      let schema = z.array(z.instanceof(File));

      if (field.required) {
        schema = schema.min(
          field.min ?? 1,
          field.errMsg ?? `Please upload at least ${field.min ?? 1} file(s)`,
        );
      }

      if (field.max) {
        schema = schema.max(
          field.max,
          `Please upload at most ${field.max} files`,
        );
      }

      if (field.size) {
        const sizeBytes = field.size * 1024 * 1024; // MB to bytes
        schema = schema.refine(
          (files) => files.every((file) => file.size <= sizeBytes),
          {
            message: `Each file must be smaller than ${field.size}MB`,
          },
        );
      }

      schema = schema.refine(
        (files) => files.every((file) => file.type.startsWith("image/")),
        {
          message: "Only image files are allowed",
        },
      );

      return field.required ? schema : schema.optional();
    }

    default:
      schema = z.any();
  }

  if (field.required) {
    return schema;
  }

  return schema.optional();
};

export function buildZodSchema(formCards: Consultation["formCards"]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (!Array.isArray(formCards)) {
    return z.object(shape);
  }

  formCards.forEach((card) => {
    const fields = (card as { fields?: FormField[] }).fields;
    if (!Array.isArray(fields)) return;
    fields.forEach((field) => {
      if (!field || typeof field !== "object") return;
      if (!("name" in field) || !("type" in field)) return;
      shape[(field as FormField).name as string] = fieldToZod(
        field as FormField,
      );
    });
  });

  return z.object(shape);
}

export function buildDefaultValues(formCards: Consultation["formCards"]) {
  const defaults: Record<string, unknown> = {};
  if (!Array.isArray(formCards)) return defaults;

  formCards.forEach((card) => {
    const fields = (card as { fields?: FormField[] }).fields;
    if (!Array.isArray(fields)) return;
    fields.forEach((field) => {
      if (!field || typeof field !== "object") return;
      if (!("name" in field) || !("type" in field)) return;

      if (field.defaultValue != null) {
        defaults[field.name as string] = field.defaultValue;
        return;
      }

      switch (field.type) {
        case "number":
          defaults[field.name as string] = undefined;
          break;
        case "checkbox":
          defaults[field.name as string] = [];
          break;
        case "date": {
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          defaults[field.name as string] = format(tomorrowDate, "yyyy-MM-dd");
          break;
        }
        case "datetime-local": {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);
          defaults[field.name as string] = format(
            tomorrow,
            "yyyy-MM-dd'T'HH:mm",
          );
          break;
        }
        case "file":
          defaults[field.name as string] = [];
          break;
        default:
          defaults[field.name as string] = "";
      }
    });
  });

  return defaults;
}
