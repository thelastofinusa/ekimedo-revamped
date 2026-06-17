import { defineQuery } from "next-sanity";

export const CATEGORIES_QUERY = defineQuery(`
    *[_type == "category"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current
    }
`);
