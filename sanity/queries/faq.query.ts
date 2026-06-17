import { defineQuery } from "next-sanity";

export const FAQ_QUERY = defineQuery(`
*[_type == "faq"] | order(_createdAt asc) {
_id,
  question,
  answer
}
`);
