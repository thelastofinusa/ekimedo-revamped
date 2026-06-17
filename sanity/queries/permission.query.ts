import { defineQuery } from "next-sanity";

export const REVIEW_PERMISSION_QUERY = defineQuery(
  `*[_type == "permissions" && lower(customerEmail) == lower($email)][0]`,
);
