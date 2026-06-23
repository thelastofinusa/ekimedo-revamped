import { defineQuery } from "next-sanity";

export const QUERY_PRODUCT = defineQuery(`
*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    delivery,
    "snapshots": snapshots[]{
      _type,
      "url": asset->url
    },
    sizes,
    stock,
    category -> {
        _id,
        name,
        "slug": slug.current
    },
}
`);

export const QUERY_PRODUCT_BY_SLUG = defineQuery(`
*[_type == "product" && slug.current == $slug] | order(_createdAt desc)[0] {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    "snapshots": snapshots[]{
      _type,
      "url": asset->url
    },
    sizes,
    stock,
    delivery,
    category -> {
        _id,
        name,
        "slug": slug.current
    },
}
`);

export const QUERY_PRODUCT_BY_IDS = defineQuery(`
*[_type == "product" && _id in $ids] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    "snapshots": snapshots[]{
      _type,
      "url": asset->url
    },
    sizes,
    stock,
    delivery,
    category -> {
        _id,
        name,
        "slug": slug.current
    },
}
`);
