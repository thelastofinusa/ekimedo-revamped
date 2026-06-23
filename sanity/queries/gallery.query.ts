import { defineQuery } from "next-sanity";

export const QUERY_GALLERY = defineQuery(`
*[_type == "gallery"] | order(_createdAt asc){
  _id,
  "image": image.asset->url,
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height,
  category->{
    name,
    "slug": slug.current
  }
}`);

export const QUERY_FEATURED_GALLERY = defineQuery(`
*[_type == "gallery"
 && featured == true
  && (!defined($category) || category->slug.current == $category)
]
| order(_createdAt asc)
[$start...$end]{
  _id,
  "image": image.asset->url,
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height,
  category->{
    name,
    "slug": slug.current
  }
}`);
