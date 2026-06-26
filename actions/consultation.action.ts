"use server";

import { siteConfig } from "@/config/site.config";
import { resolveFieldValue } from "@/lib/consultation";
import { getStripe } from "@/lib/stripe";
import { getEasternDay } from "@/lib/time";
import { FormCard } from "@/sanity.types";
import { client, writeClient } from "@/sanity/lib/client";
import {
  QUERY_BLOCKED_SLOTS,
  QUERY_BOOKINGS_FOR_DATE,
} from "@/sanity/queries/blockedSlot.query";
import { QUERY_BOOKING_BY_ID } from "@/sanity/queries/booking.query";
import { QUERY_BUSINESS_HOURS } from "@/sanity/queries/hour.query";
import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

// --------------------------------------------------------------
// BOOK CONSULTATION – creates booking and Stripe Checkout session
// --------------------------------------------------------------
export async function bookConsultation(formData: Record<string, unknown>) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) throw new Error("Unauthorized");

  const { consultationSlug, dateTime, paymentMethod, ...rest } = formData;
  if (!consultationSlug || !dateTime) {
    return { success: false, message: "Missing consultation or date/time." };
  }

  const dateObj = new Date(dateTime as string);
  const dateStr = dateObj.toISOString().split("T")[0];

  // Re-check availability (prevent race conditions)
  const availability = await getAvailableTimes(
    consultationSlug as string,
    dateStr,
  );
  if (availability.blocked) {
    return { success: false, message: availability.message };
  }

  const timeStr = formatTime(
    dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes(),
  );
  if (!availability.slots.includes(timeStr)) {
    return { success: false, message: "The selected time is not available." };
  }

  // Fetch consultation with full field metadata
  const consultation = await client.fetch(
    `*[_type == "consultation" && slug.current == $slug][0]{
    _id,
    title,
    price,
    formCards[]{
      fields[]{
        name,
        type,
        label,
        options[]{ id, label },
        items[]{ id, title }
      }
    }
  }`,
    {
      slug: consultationSlug,
    },
  );
  if (!consultation) {
    return { success: false, message: "Consultation not found." };
  }

  // Build formFields array (without type mismatch)
  const formFields: {
    _key: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    value: string;
    files?: {
      _type: "image";
      _key: string;
      asset: { _type: "reference"; _ref: string };
    }[];
  }[] = [];

  // Flatten fields without explicit type annotation to avoid TS error
  const allFields =
    consultation.formCards?.flatMap((card: FormCard) => card.fields || []) ||
    [];

  for (const field of allFields) {
    const rawValue = rest[field.name];
    if (rawValue === undefined) continue;

    if (field.type === "file") {
      // Expect the client to have already uploaded files and passed references
      const uploadedFiles = Array.isArray(rawValue) ? rawValue : [rawValue];
      formFields.push({
        _key: randomUUID(),
        fieldName: field.name,
        fieldLabel: field.label || field.name,
        fieldType: field.type,
        value: `${uploadedFiles.length} image(s) uploaded`,
        files: uploadedFiles, // already in { _type, _key, asset } format
      });
      continue;
    }

    formFields.push({
      _key: randomUUID(),
      fieldName: field.name,
      fieldLabel: field.label || field.name,
      fieldType: field.type,
      value: resolveFieldValue(field, rawValue),
    });
  }

  // Create booking with status "pending"
  let bookingId: string;
  try {
    const fName = (rest.fName as string) || "";
    const lName = (rest.lName as string) || "";
    const customerName =
      [fName, lName].filter(Boolean).join(" ").trim() ||
      user.fullName ||
      user.firstName ||
      "Unknown";

    const booking = await writeClient.create({
      _type: "booking",
      consultation: { _type: "reference", _ref: consultation._id },
      dateTime: dateTime,
      customerName: customerName,
      customerEmail: user.primaryEmailAddress?.emailAddress || "",
      customerPhone: (rest.phone as string) || "",
      status: "pending",
      paymentMethod: paymentMethod === "card" ? "stripe" : paymentMethod,
      formFields,
    });
    bookingId = booking._id;
  } catch (error) {
    console.error("Booking creation failed:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create booking.",
    };
  }

  // --- Create Stripe Checkout Session ---
  let session;
  const stripe = getStripe();
  const amount = consultation.price || 0;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [paymentMethod as "card" | "paypal"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation: ${consultation.title}`,
              description: `Booking for ${consultation.title}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingId,
        consultationSlug: consultationSlug as string,
      },
      success_url: `${siteConfig.url}/consultations/${consultationSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/consultations/${consultationSlug}?payment=failed&booking_id=${bookingId}`,
      customer_email: user.primaryEmailAddress?.emailAddress || "",
    });
  } catch (error) {
    // Update booking status to cancelled
    await writeClient.patch(bookingId).set({ status: "cancelled" }).commit();
    console.error("Stripe session creation failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message.includes("paypal")
            ? "Looks Like paypal payment method isn't supported yet"
            : error.message
          : "Payment processing failed. Please try again.",
    };
  }

  // Store session ID and return
  await writeClient
    .patch(bookingId)
    .set({ stripeSessionId: session.id })
    .commit();

  return {
    success: true,
    url: session.url,
    bookingId,
    consultationSlug: consultationSlug as string,
  };
}

// --------------------------------------------------------------
// GET AVAILABLE TIMES
// --------------------------------------------------------------
type AvailabilityResult = {
  slots: string[];
  blocked: boolean;
  message: string | null;
};

export async function getAvailableTimes(
  consultationSlug: string,
  dateStr: string,
): Promise<AvailabilityResult> {
  // 1. Get consultation ID
  const consultation = await client.fetch(
    `*[_type == "consultation" && slug.current == $slug][0]{ _id }`,
    { slug: consultationSlug },
  );
  if (!consultation) throw new Error("Consultation not found");
  const consultationId = consultation._id;

  // 2. Get business hours for that day
  const businessHours = await client.fetch(QUERY_BUSINESS_HOURS);
  const dayOfWeek = getEasternDay(dateStr);
  const dayHours = businessHours?.hours?.find((h) => h.day === dayOfWeek);
  if (!dayHours || !dayHours.isOpen) {
    return {
      slots: [],
      blocked: true,
      message: "We are closed on this day.",
    };
  }
  const openTime = dayHours.startTime;
  const closeTime = dayHours.endTime;

  // 3. Generate all possible slots (30‑minute intervals)
  const SLOT_INTERVAL = 30;
  const slots: string[] = [];
  let current = parseTime(openTime as string);
  const close = parseTime(closeTime as string);
  while (current < close) {
    slots.push(formatTime(current));
    current += SLOT_INTERVAL;
  }

  // 4. Fetch blocked slots (global + specific)
  const blockedSlots = await client.fetch(QUERY_BLOCKED_SLOTS, {
    date: dateStr,
    consultationId,
  });

  let blockMessage: string | null = null;
  const blockedTimes = new Set<string>();
  let allDayBlocked = false;
  const DEFAULT_DURATION = 60;

  for (const block of blockedSlots) {
    if (block.allDay) {
      allDayBlocked = true;
      if (block.message) blockMessage = block.message;
      break;
    }

    let duration =
      block.consultationDuration ?? block.duration ?? DEFAULT_DURATION;
    if (typeof duration !== "number" || duration <= 0) {
      duration = DEFAULT_DURATION;
    }

    const blockStart = parseTime(block.startTime as string);
    const blockEnd = blockStart + duration;

    for (const slot of slots) {
      const slotMinutes = parseTime(slot);
      if (slotMinutes >= blockStart && slotMinutes < blockEnd) {
        blockedTimes.add(slot);
      }
    }

    if (block.message && !blockMessage) {
      blockMessage = block.message;
    }
  }

  // --- FIX: early return if allDay blocked ---
  if (allDayBlocked) {
    return {
      slots: [],
      blocked: true,
      message: blockMessage || "This day is fully booked.",
    };
  }

  // 5. Fetch existing bookings for this date
  const startDate = new Date(dateStr + "T00:00:00.000Z");
  const endDate = new Date(dateStr + "T23:59:59.999Z");
  const bookings = await client.fetch(QUERY_BOOKINGS_FOR_DATE, {
    consultationId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  const bookedTimes = new Set<string>();
  for (const booking of bookings) {
    const bookingDate = new Date(booking.dateTime as string);
    const mins = bookingDate.getHours() * 60 + bookingDate.getMinutes();
    bookedTimes.add(formatTime(mins));
  }

  // 6. Filter out blocked and booked slots
  const unavailable = new Set([...blockedTimes, ...bookedTimes]);
  const availableSlots = slots.filter((slot) => !unavailable.has(slot));

  if (availableSlots.length === 0) {
    return {
      slots: [],
      blocked: true,
      message: blockMessage || "No available time slots for this day.",
    };
  }

  return { slots: availableSlots, blocked: false, message: null };
}

export async function cancelBooking(bookingId: string) {
  console.log(`Attempting to cancel booking: ${bookingId}`);
  const booking = await client.fetch(
    `*[_type == "booking" && _id == $id][0]{ status }`,
    { id: bookingId },
  );
  console.log("Booking found:", booking);
  if (!booking) return { success: false, message: "Booking not found" };
  if (booking.status !== "pending") {
    console.log("Booking status is not pending:", booking.status);
    return { success: false, message: "Booking already processed." };
  }
  await writeClient.patch(bookingId).set({ status: "cancelled" }).commit();
  console.log("Booking cancelled successfully");
  return { success: true };
}

/**
 * Fetch booking details by ID
 * Used for displaying booking confirmation
 */
export async function getBookingDetails(bookingId: string) {
  const booking = await client.fetch(QUERY_BOOKING_BY_ID, { id: bookingId });
  return booking;
}

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function updateBookingWithSessionId(
  bookingId: string,
  sessionId: string,
) {
  await writeClient
    .patch(bookingId)
    .set({ stripeSessionId: sessionId })
    .commit();
}
