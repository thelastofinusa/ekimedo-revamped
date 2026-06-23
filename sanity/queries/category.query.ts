import { defineQuery } from "next-sanity";

export const QUERY_CATEGORIES = defineQuery(`
    *[_type == "category"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current
    }
`);
