"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { client, writeClient } from "@/sanity/lib/client";
import { BUSINESS_HOUR_QUERY } from "@/sanity/queries/hours";
import {
  BLOCKED_SLOTS_QUERY,
  BOOKINGS_FOR_DATE_QUERY,
} from "@/sanity/queries/blockedSlot";
import { randomUUID } from "crypto";

// --------------------------------------------------------------
// Public: get available time slots for a given consultation & date
// --------------------------------------------------------------
type AvailabilityResult = {
  slots: string[];
  blocked: boolean;
  message: string | null;
};

export async function getAvailableTimes(
  consultationSlug: string,
  dateStr: string, // "YYYY-MM-DD"
): Promise<AvailabilityResult> {
  // 1. Get consultation ID
  const consultation = await client.fetch(
    `*[_type == "consultation" && slug.current == $slug][0]{ _id }`,
    { slug: consultationSlug },
  );
  if (!consultation) throw new Error("Consultation not found");
  const consultationId = consultation._id;

  // 2. Get business hours for that day (using local timezone America/New_York)
  const businessHours = await client.fetch(BUSINESS_HOUR_QUERY);
  const dayOfWeek = new Date(dateStr + "T00:00:00Z").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      timeZone: "UTC",
    },
  );
  const dayHours = businessHours?.hours?.find((h) => h.day === dayOfWeek);
  if (!dayHours || !dayHours.isOpen) {
    return { slots: [], blocked: true, message: "We are closed on this day." };
  }
  const openTime = dayHours.startTime; // "09:00"
  const closeTime = dayHours.endTime; // "17:00"

  // 3. Generate all possible slots (30‑minute intervals)
  const SLOT_INTERVAL = 30; // minutes
  const slots: string[] = [];
  let current = parseTime(openTime as string);
  const close = parseTime(closeTime as string);
  while (current < close) {
    slots.push(formatTime(current));
    current += SLOT_INTERVAL;
  }

  // 4. Fetch blocked slots (global + specific)
  const blockedSlots = await client.fetch(BLOCKED_SLOTS_QUERY, {
    date: dateStr,
    consultationId,
  });

  let blockMessage: string | null = null;
  const blockedTimes = new Set<string>();
  let allDayBlocked = false;
  const DEFAULT_DURATION = 60; // fallback if no duration provided

  for (const block of blockedSlots) {
    if (block.allDay) {
      allDayBlocked = true;
      if (block.message) blockMessage = block.message;
      break;
    }

    // Determine duration: prefer consultation duration, then block's duration, then default
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

  // 5. Fetch existing bookings for this date
  const startDate = new Date(dateStr + "T00:00:00.000Z");
  const endDate = new Date(dateStr + "T23:59:59.999Z");
  const bookings = await client.fetch(BOOKINGS_FOR_DATE_QUERY, {
    consultationId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  const bookedTimes = new Set<string>();
  for (const booking of bookings) {
    const bookingDate = new Date(booking.dateTime as string);
    // Use the same timezone as the slot generation
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

// --------------------------------------------------------------
// Server action: book a consultation
// --------------------------------------------------------------
export async function bookConsultation(formData: Record<string, unknown>) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) throw new Error("Unauthorized");

  const { consultationSlug, dateTime, paymentMethod, ...rest } = formData;
  if (!consultationSlug || !dateTime) {
    return { success: false, error: "Missing consultation or date/time." };
  }

  const dateObj = new Date(dateTime as string);
  const dateStr = dateObj.toISOString().split("T")[0]; // still UTC for consistency

  // Re-check availability (prevent race conditions)
  const availability = await getAvailableTimes(
    consultationSlug as string,
    dateStr,
  );
  if (availability.blocked) {
    return {
      success: false,
      error: availability.message || "This time slot is not available.",
    };
  }

  const timeStr = formatTime(
    dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes(),
  );
  if (!availability.slots.includes(timeStr)) {
    return { success: false, error: "The selected time is not available." };
  }

  // Fetch consultation with formCards structure
  const consultation = await writeClient.fetch(
    `*[_type == "consultation" && slug.current == $slug][0]{
      _id,
      title,
      price,
      formCards[]{
        fields[]{
          name,
          label
        }
      }
    }`,
    { slug: consultationSlug },
  );
  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  // Build formFields array with unique _key
  const formFields: {
    _key: string;
    fieldName: string;
    fieldLabel: string;
    value: string;
  }[] = [];

  const allFields =
    consultation.formCards?.flatMap(
      (card: { fields: unknown }) => card.fields || [],
    ) || [];

  for (const field of allFields) {
    const fieldName = field.name;
    const fieldLabel = field.label || fieldName;
    const rawValue = rest[fieldName];
    if (rawValue !== undefined) {
      let stringValue: string;
      if (Array.isArray(rawValue)) {
        stringValue = rawValue.join(", ");
      } else if (typeof rawValue === "object" && rawValue !== null) {
        stringValue = JSON.stringify(rawValue);
      } else {
        stringValue = String(rawValue);
      }
      formFields.push({
        _key: randomUUID(),
        fieldName,
        fieldLabel,
        value: stringValue,
      });
    }
  }

  // Create booking with status "paid"
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
      paymentMethod: paymentMethod || "stripe",
      formFields,
      formData: JSON.stringify(rest),
    });
    bookingId = booking._id;
  } catch (error) {
    console.error("Booking creation failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create booking.",
    };
  }

  return {
    success: true,
    bookingId,
    consultationId: consultation._id,
    consultationTitle: consultation.title,
    amount: consultation.price,
    customerEmail: user.primaryEmailAddress?.emailAddress || "",
    customerName: user.fullName || user.firstName || "Unknown",
  };
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
