import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { MAX_SERVER_BODY_SIZE_BYTES } from "../constants/keys";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertValue<T>(
  v: T | undefined,
  errorMessage?: string,
): NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error(errorMessage ?? "Missing property");
  }
  return v;
}

export function estimateFormDataSize(formData: FormData) {
  let total = 0;

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      total += value.size;
    } else {
      total += new TextEncoder().encode(String(value)).length;
    }
  }

  // small multipart overhead buffer (headers, boundaries)
  const overhead = 10 * 1024; // ~10KB safety buffer

  return total + overhead;
}

export function isFormTooLarge(formData: FormData, maxBytes: number) {
  return estimateFormDataSize(formData) > maxBytes;
}

export function validateFormSizeOrWarn({
  formData,
  label = "Request",
}: {
  formData: FormData;
  label?: string;
}) {
  const size = estimateFormDataSize(formData);

  if (size > MAX_SERVER_BODY_SIZE_BYTES) {
    toast.warning(`${label} too large`, {
      description:
        `This submission is ~${(size / 1024 / 1024).toFixed(2)}MB. ` +
        "It may fail. Try reducing image count or size.",
      duration: 8000,
    });

    return false;
  }

  return true;
}
