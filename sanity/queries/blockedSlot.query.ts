import { defineQuery } from "next-sanity";

export const QUERY_BLOCKED_SLOTS = defineQuery(`
  *[_type == "blockedSlot" &&
    (!defined($consultationId) || consultation._ref == $consultationId || consultation._ref == null) &&
    startDateTime <= $endOfDay && 
    (!defined(endDateTime) || endDateTime >= $startOfDay)
  ] {
    startDateTime,
    endDateTime,
    message
  }
`);

export const QUERY_BOOKINGS_FOR_DATE = defineQuery(`
  *[
    _type == "booking" &&
    dateTime >= $start &&
    dateTime < $end &&
    (!defined(status) || status != "cancelled")
  ] {
    dateTime,
    consultation->{
      duration
    }
  }
`);
