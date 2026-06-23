import { defineQuery } from "next-sanity";

export const QUERY_PRICING_TIERS = defineQuery(`
*[_type == "pricingTier"] | order(order asc, _createdAt asc) {
  _id,
  name,
  price,
  description,
  features
}
`);
