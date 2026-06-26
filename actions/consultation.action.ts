"use server";

import { siteConfig } from "@/config/site.config";
import { resolveFieldValue } from "@/lib/consultation";
import { getStripe } from "@/lib/stripe";
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
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const BOOKING_TIMEZONE = "America/New_York";
const SLOT_INTERVAL = 30;

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

  const dateTimeISO = dateTime as string; // e.g., "2026-07-03T14:30:00.000Z"
  const dateObj = new Date(dateTimeISO); // UTC Date
  if (Number.isNaN(dateObj.getTime())) {
    return { success: false, message: "Invalid consultation date/time." };
  }

  const dateStr = formatInTimeZone(dateObj, BOOKING_TIMEZONE, "yyyy-MM-dd");
  const easternTimeStr = formatInTimeZone(dateObj, BOOKING_TIMEZONE, "HH:mm");
  const selectedMinutes = parseTime(easternTimeStr);

  // 1. Business hours check (early)
  const businessHours = await client.fetch(QUERY_BUSINESS_HOURS);
  const dayOfWeek = getBookingDay(dateStr);
  const dayHours = businessHours?.hours?.find((h) => h.day === dayOfWeek);
  if (!dayHours || !dayHours.isOpen) {
    return { success: false, message: "We are closed on this day." };
  }
  const openMinutes = parseTime(dayHours.startTime as string);
  const closeMinutes = parseTime(dayHours.endTime as string);
  if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
    return {
      success: false,
      message: "Selected time is outside business hours.",
    };
  }

  // Re-check availability (prevent race conditions)
  const availability = await getAvailableTimes(
    consultationSlug as string,
    dateStr,
  );
  if (availability.blocked) {
    return { success: false, message: availability.message };
  }

  const timeStr = formatTime(selectedMinutes);
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
      dateTime: dateTimeISO,
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
    // PayPal is handled separately via native API – only "card" here
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [
        paymentMethod === "stripe"
          ? "card"
          : paymentMethod === "paypal"
            ? "paypal"
            : "card",
      ], // 👈 fixed
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
  const consultation = await client.fetch(
    `*[_type == "consultation" && slug.current == $slug][0]{ _id, duration }`,
    { slug: consultationSlug },
  );
  if (!consultation) throw new Error("Consultation not found");
  const consultationId = consultation._id;
  const consultationDuration = consultation.duration || SLOT_INTERVAL;

  // 1. Business hours
  const businessHours = await client.fetch(QUERY_BUSINESS_HOURS);
  const dayOfWeek = getBookingDay(dateStr);
  const dayHours = businessHours?.hours?.find((h) => h.day === dayOfWeek);
  if (!dayHours || !dayHours.isOpen) {
    return { slots: [], blocked: true, message: "We are closed on this day." };
  }
  const openTime = dayHours.startTime as string;
  const closeTime = dayHours.endTime as string;
  const slots: string[] = [];
  let current = parseTime(openTime);
  const close = parseTime(closeTime);
  while (current + consultationDuration <= close) {
    slots.push(formatTime(current));
    current += SLOT_INTERVAL;
  }

  // 2. Fetch blocked slots that overlap with the day (time-range aware)
  const startOfDay = fromZonedTime(`${dateStr}T00:00:00`, BOOKING_TIMEZONE);
  const endOfDay = fromZonedTime(
    `${addDays(dateStr, 1)}T00:00:00`,
    BOOKING_TIMEZONE,
  );
  const blockedSlots = await client.fetch(QUERY_BLOCKED_SLOTS, {
    consultationId,
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  const blockedTimes = new Set<string>();
  let blockMessage: string | null = null;

  for (const block of blockedSlots) {
    const blockStart = new Date(block.startDateTime as string);
    const blockEnd = block.endDateTime
      ? new Date(block.endDateTime as string)
      : new Date(blockStart.getTime() + SLOT_INTERVAL * 60 * 1000);

    if (blockStart <= startOfDay && blockEnd >= endOfDay) {
      return {
        slots: [],
        blocked: true,
        message: block.message || "This day is fully booked.",
      };
    }

    // Otherwise, check each slot against this block's time window
    for (const slot of slots) {
      const slotStart = fromZonedTime(
        `${dateStr}T${slot}:00`,
        BOOKING_TIMEZONE,
      );
      const slotEnd = new Date(
        slotStart.getTime() + consultationDuration * 60 * 1000,
      );

      if (blockStart < slotEnd && blockEnd > slotStart) {
        blockedTimes.add(slot);
        if (block.message && !blockMessage) {
          blockMessage = block.message;
        }
      }
    }
  }

  // 3. Fetch existing bookings for this date
  const bookings = await client.fetch(QUERY_BOOKINGS_FOR_DATE, {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString(),
  });

  const bookedTimes = new Set<string>();
  for (const booking of bookings) {
    const bookingDate = new Date(booking.dateTime as string);
    const bookingDuration =
      booking.consultation?.duration || consultationDuration;
    const bookingEnd = new Date(
      bookingDate.getTime() + bookingDuration * 60 * 1000,
    );

    for (const slot of slots) {
      const slotStart = fromZonedTime(
        `${dateStr}T${slot}:00`,
        BOOKING_TIMEZONE,
      );
      const slotEnd = new Date(
        slotStart.getTime() + consultationDuration * 60 * 1000,
      );

      if (bookingDate < slotEnd && bookingEnd > slotStart) {
        bookedTimes.add(slot);
      }
    }
  }

  // 4. Filter out blocked and booked slots
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

function getBookingDay(dateStr: string): string {
  return formatInTimeZone(
    fromZonedTime(`${dateStr}T12:00:00`, BOOKING_TIMEZONE),
    BOOKING_TIMEZONE,
    "EEEE",
  );
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
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
