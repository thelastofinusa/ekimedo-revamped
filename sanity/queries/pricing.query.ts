import { defineQuery } from "next-sanity";

export const PRICING_TIERS_QUERY = defineQuery(`
*[_type == "pricingTier"] | order(order asc, _createdAt asc) {
  _id,
  name,
  price,
  description,
  features
}
`);
