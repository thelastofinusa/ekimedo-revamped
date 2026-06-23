import { defineQuery } from "next-sanity";

export const QUERY_BOOKING_PROCESS = defineQuery(`
    *[_type == "bookingProcess"] | order(order asc, _createdAt asc) {
        _id,
        title,
        description,
        icon,
        order,
    }
`);
