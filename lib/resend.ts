import { Resend } from "resend";
import { assertValue } from "./utils";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const key = assertValue(
      process.env.RESEND_API_KEY,
      "RESEND_API_KEY environment variable is not set",
    );
    resendInstance = new Resend(key);
  }
  return resendInstance;
}
