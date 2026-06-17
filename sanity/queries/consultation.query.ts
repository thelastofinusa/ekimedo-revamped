import { defineQuery } from "next-sanity";

export const CONSULTATION_QUERY = defineQuery(`
*[
  _type == "consultation" &&
  onPMPage == $onPMPage
] | order(order asc, _createdAt asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  duration,
  price,
  dresses,
  order,
  onPMPage,

  "image": image.asset->url,

  includes[],

  formCards[] {
    title,
    "id": id.current,
    info,
    description,

    fields[] {
      name,
      type,
      label,
      placeholder,

      description {
        value,
        path,
        newTab
      },

      required,
      errMsg,
      group,
      defaultValue,
      min,
      max,
      size,

      icons {
        start,
        end
      },

      sizes[],

      options[] {
        id,
        label,
        description,

        interests[] {
          id,
          label,
          description
        }
      },

      items[] {
        id,
        title,
        description,

        range {
          from,
          to
        }
      }
    }
  }
}
`);

export const CONSULTATION_BY_SLUG_QUERY = defineQuery(`
*[
  _type == "consultation" &&
  slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  duration,
  price,
  dresses,
  order,
  onPMPage,

  "image": image.asset->url,

  includes[],

  formCards[] {
    title,
    "id": id.current,
    info,
    description,

    fields[] {
      name,
      type,
      label,
      placeholder,

      description {
        value,
        path,
        newTab
      },

      required,
      errMsg,
      group,
      defaultValue,
      min,
      max,
      size,

      icons {
        start,
        end
      },

      sizes[],

      options[] {
        id,
        label,
        description,

        interests[] {
          id,
          label,
          description
        }
      },

      items[] {
        id,
        title,
        description,

        range {
          from,
          to
        }
      }
    }
  }
}
`);
