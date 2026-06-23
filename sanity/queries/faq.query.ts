import { defineQuery } from "next-sanity";

export const QUERY_FAQ = defineQuery(`
*[_type == "faq"] | order(_createdAt asc) {
_id,
  question,
  answer
}`);
