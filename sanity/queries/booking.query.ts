import { defineQuery } from "next-sanity";

export const QUERY_BOOKING_BY_ID = defineQuery(`
  *[_type == "booking" && _id == $id][0] {
    _id,
    consultation->{
      title
    },
    dateTime,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    status,
    formFields[] {
      fieldLabel,
      fieldType,
      fieldName,
      value,
      files[] {
        asset->{
          url
        }
      }
    }
  }
`);

export const QUERY_BOOKING_BY_STRIPE_SESSION_ID = defineQuery(`
  *[_type == "booking" && stripeSessionId == $sessionId][0] {
    _id,
    consultation->{
      title
    },
    dateTime,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    status,
    formFields[] {
      fieldLabel,
      fieldType,
      fieldName,
      value,
      files[] {
        asset->{
          url
        }
      }
    }
  }
`);
