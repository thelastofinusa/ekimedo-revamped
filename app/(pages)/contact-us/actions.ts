"use server";
import { ZSchemaType } from "@/lib/validators";
import { createContactMessageService } from "@/services/contact.service";

export async function submitContactMessage(formData: ZSchemaType["contact"]) {
  return await createContactMessageService(formData);
}
