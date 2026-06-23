import { defineQuery } from "next-sanity";

export const QUERY_INQUIRY_BY_ID = defineQuery(`
  *[_type == "inquiry" && _id == $id][0] {
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    eventType,
    eventDate,
    budget,
    dreamDress,
    status,
    inspirationPhotos[]{
      _key,
      asset->{
        _id,
        url
      }
    }
  }
`);
