import { defineQuery } from "next-sanity";

export const QUERY_CANCELLATION_POLICY = defineQuery(`
    *[_type == "cancellationPolicy"]{
        _id,
        title,
        description,
        icon,
    }
`);
