import { defineQuery } from "next-sanity";

export const QUERY_CONSULTATIONS = defineQuery(`
*[
  _type == "consultation" &&
  ($onPMPage == null || onPMPage == $onPMPage)
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
    _type,
    title,
    info,
    description,

    fields[] {
      _type,
      _key,
      name,
      type,
      label,
      placeholder,

      description {
        _type,
        value,
        path,
        newTab
      },

      required,
      errMsg,
      group,
      defaultValue,

      icons {
        _type,
        start {
          _type,
          icon,
          value
        },
        end {
          _type,
          icon,
          value
        }
      },

      sizes[],

      options[] {
        _type,
        _key,
        id,
        label,
        description,

        interests[] {
          _key,
          _type,
          id,
          label,
          description
        }
      },

      items[] {
        _type,
        _key,
        id,
        title,
        description,
        "images": images[].asset->url,

        range {
          _type,
          from,
          to
        }
      }
    }
  }
}
`);

export const QUERY_CONSULTATION_BY_SLUG = defineQuery(`
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
    _type,
    title,
    info,
    description,

    fields[] {
      _type,
      _key,
      name,
      type,
      label,
      placeholder,

      description {
        _type,
        value,
        path,
        newTab
      },

      required,
      errMsg,
      group,
      defaultValue,

      icons {
        _type,
        start {
          _type,
          icon,
          value
        },
        end {
          _type,
          icon,
          value
        }
      },

      sizes[],

      options[] {
        _type,
        _key,
        id,
        label,
        description,

        interests[] {
          _key,
          _type,
          id,
          label,
          description
        }
      },

      items[] {
        _type,
        _key,
        id,
        title,
        description,
        "images": images[].asset->url,

        range {
          _type,
          from,
          to
        }
      }
    }
  }
}
`);
