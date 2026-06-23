import { defineQuery } from "next-sanity";

export const QUERY_BUSINESS_HOURS = defineQuery(`
  *[_id == "businessHours"][0]{
    hours[]{
      _key,
      day,
      isOpen,
      startTime,
      endTime
    }
  }
`);
