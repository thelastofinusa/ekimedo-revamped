import { defineQuery } from "next-sanity";

export const PRODUCT_COLOR_QUERY = defineQuery(`
*[_type == "productColor"]{
  name,
  "hex": value.hex
}
`);
