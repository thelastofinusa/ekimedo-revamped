import { defineQuery } from "next-sanity";

export const QUERY_REVIEW_PERMISSION = defineQuery(
  `*[_type == "permission" && lower(customerEmail) == lower($email)][0]`,
);
