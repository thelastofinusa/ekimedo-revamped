import { defineQuery } from "next-sanity";

export const SOCIAL_QUERY = defineQuery(`
    *[_type == "social"] | order(_createdAt desc) {
        _id,
        name,
        url
    }
`);
