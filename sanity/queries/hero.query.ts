import { defineQuery } from "next-sanity";

export const QUERY_HERO_IMAGES = defineQuery(`
    *[_type == "hero"] | order(_createdAt desc) {
        _id,
        "image": image.asset->url,
        alt
    }
`);
