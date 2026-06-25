import { defineQuery } from "next-sanity";

export const QUERY_REVIEW_PERMISSION = defineQuery(
  `*[_type == "permission" && lower(customerEmail) == lower($email)][0]`,
);

export const QUERY_REVIEW_PERMISSION_BY_ID = defineQuery(`
  *[_type == "permission" && _id == $id][0]{
    _id,
    customerName,
    customerEmail
  }
`);
