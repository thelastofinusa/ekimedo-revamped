"use server";
import { ZSchemaType } from "@/lib/validators";
import { createInquiryService } from "@/services/inquiry.service";

export async function submitContactInquiry(formData: FormData) {
  return await createInquiryService(formData);
}
