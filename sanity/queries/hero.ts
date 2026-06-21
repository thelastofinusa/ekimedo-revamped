import { defineQuery } from "next-sanity";

export const HERO_QUERY = defineQuery(`
    *[_type == "hero"] | order(_createdAt desc) {
        _id,
        "image": image.asset->url,
        alt
    }
`);
