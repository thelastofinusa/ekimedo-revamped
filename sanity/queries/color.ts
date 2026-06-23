import { defineQuery } from "next-sanity";

export const QUERY_PRODUCT_COLOR = defineQuery(`
*[_type == "productColor"]{
  name,
  "hex": value.hex
}
`);
