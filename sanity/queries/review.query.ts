import { defineQuery } from "next-sanity";

export const QUERY_REVIEWS = defineQuery(`
*[_type == "testimonial" && status == "approved"] | order(date desc) {
    _id,
    "avatar": avatar.asset->url,
    service,
    date,
    name,
    rating,
    review,
    "workAssets": workAssets[].asset->url
}
`);
