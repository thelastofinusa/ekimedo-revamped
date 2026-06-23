import { defineQuery } from "next-sanity";

export const QUERY_SOCIAL_HANDLES = defineQuery(`
    *[_type == "social"] | order(_createdAt desc) {
        _id,
        name,
        url,
        icon
    }
`);
