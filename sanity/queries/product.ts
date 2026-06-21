import { defineQuery } from "next-sanity";

export const PRODUCT_QUERY = defineQuery(`
*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    delivery,
    "images": images[].asset->url,
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

export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
*[_type == "product" && slug.current == $slug] | order(_createdAt desc)[0] {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    "images": images[].asset->url,
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

export const PRODUCT_BY_IDS_QUERY = defineQuery(`
*[_type == "product" && _id in $ids] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    colors[]->{name, "value": value.hex},
    description,
    "images": images[].asset->url,
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
