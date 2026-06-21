import { defineQuery } from "next-sanity";

export const BLOCKED_SLOTS_QUERY = defineQuery(`
  *[_type == "blockedSlot" && date == $date && ( !defined($consultationId) || consultation._ref == $consultationId || consultation._ref == null) ] {
    allDay,
    startTime,
    duration,
    message,
    "consultationDuration": consultation->duration
  }
`);

export const BOOKINGS_FOR_DATE_QUERY = defineQuery(`
  *[_type == "booking" && consultation._ref == $consultationId && dateTime >= $start && dateTime < $end] {
    dateTime
  }
`);
