import { defineQuery } from "next-sanity";

export const REVIEW_QUERY = defineQuery(`
*[_type == "testimonial" && status == "approved"] | order(date desc) {
    _id,
    "avatar": avatar.asset->url,
    clerkUser,
    service,
    date,
    name,
    rating,
    review,
    "workAssets": workAssets[].asset->url
}
`);
