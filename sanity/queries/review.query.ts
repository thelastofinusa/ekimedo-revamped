import { defineQuery } from "next-sanity";

export const QUERY_REVIEWS = defineQuery(`
*[_type == "testimonial" && status == "approved"] | order(date desc) {
    _id,
    "avatar": avatar.asset->url,
    service,
    date,
    name,
    email,
    rating,
    review,
    "workAssets": workAssets[].asset->url
}
`);

export const QUERY_REVIEW_BY_ID = defineQuery(`
  *[_type == "testimonial" && _id == $id][0]{
    _id,
    name,
    email,
    service,
    status,
    rating,
    review,
    date
  }
`);
