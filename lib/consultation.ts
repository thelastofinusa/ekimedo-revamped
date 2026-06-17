import { Consultation, FormField } from "@/sanity.types";
import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

const fieldToZod = (field: FormField) => {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
    case "size":
    case "textarea":
    case "select":
      schema = field.required ? z.string().min(2, field.errMsg) : z.string();
      break;

    case "tel": {
      const base = z
        .string()
        .trim()
        .refine(isValidPhoneNumber, {
          message: field.errMsg ?? "Invalid phone number",
        });
      schema = field.required ? base : base.optional();
      break;
    }

    case "email":
      schema = field.required ? z.email(field.errMsg) : z.email();
      break;

    case "number":
      schema = z.coerce.number();
      break;

    case "date":
    case "datetime-local":
      schema = z.coerce.date({
        error: field.errMsg ?? "Invalid date",
      });
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
        schema = schema.refine(
          (files) => files.every((file) => file.size <= field.size!),
          {
            message: `Each file must be smaller than ${
              field.size / 1024 / 1024
            }MB`,
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

  if (!Array.isArray(formCards)) {
    return defaults;
  }

  formCards.forEach((card) => {
    const fields = (card as { fields?: FormField[] }).fields;
    if (!Array.isArray(fields)) return;
    fields.forEach((field) => {
      if (!field || typeof field !== "object") return;
      if (!("name" in field) || !("type" in field)) return;
      const typedField = field as FormField;

      if (typedField.defaultValue !== undefined) {
        defaults[typedField.name as string] = typedField.defaultValue;
        return;
      }

      switch (typedField.type) {
        case "number":
          defaults[typedField.name as string] = undefined;
          break;
        case "checkbox":
          defaults[typedField.name as string] = [];
          break;
        case "date":
        case "datetime-local":
          defaults[typedField.name as string] = undefined;
          break;
        case "file":
          defaults[typedField.name as string] = [];
          break;
        default:
          defaults[typedField.name as string] = "";
      }
    });
  });

  return defaults;
}
