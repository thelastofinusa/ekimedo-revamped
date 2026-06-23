import { defineQuery } from "next-sanity";

export const QUERY_BLOCKED_SLOTS = defineQuery(`
  *[_type == "blockedSlot" && date == $date && ( !defined($consultationId) || consultation._ref == $consultationId || consultation._ref == null) ] {
    allDay,
    startTime,
    duration,
    message,
    "consultationDuration": consultation->duration
  }
`);

export const QUERY_BOOKINGS_FOR_DATE = defineQuery(`
  *[_type == "booking" && consultation._ref == $consultationId && dateTime >= $start && dateTime < $end] {
    dateTime
  }
`);
