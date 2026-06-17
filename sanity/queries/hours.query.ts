import { defineQuery } from "next-sanity";

export const BUSINESS_HOUR_QUERY = defineQuery(`
    *[_type == "businessHours"]{
  hours[]
}[0]
`);
