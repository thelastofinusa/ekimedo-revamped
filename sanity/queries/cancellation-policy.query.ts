import { defineQuery } from "next-sanity";

export const CANCELLATION_POLICY_QUERY = defineQuery(`
    *[_type == "cancellationPolicy"]{
        _id,
        title,
        description,
        icon,
    }
`);
