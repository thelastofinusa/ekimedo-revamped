import { defineQuery } from "next-sanity";

/**
 * Get orders by Clerk user ID
 * Used on orders list page
 */
export const QUERY_ORDERS_BY_USER = defineQuery(`*[
  _type == "order"
  && clerkUserId == $clerkUserId
] | order(createdAt desc) {
  _id,
  orderNumber,
  total,
  status,
  createdAt,
  "itemCount": count(items),
  "itemNames": items[].product->name,
  "itemImages": items[].product->snapshots[0]{
    _type,
    "url": asset->url
  }
}`);

/**
 * Get single order by ID with full details
 * Used on order detail page
 */
export const QUERY_ORDER_BY_ID = defineQuery(`*[
  _type == "order"
  && _id == $id
][0] {
  _id,
  orderNumber,
  clerkUserId,
  email,
  items[]{
    _key,
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      "slug": slug.current,
      "snapshots": snapshots[0..0]{
        _type,
        "url": asset->url
      }
    }
  },
  total,
  status,
  address{
    name,
    line1,
    line2,
    city,
    postcode,
    country
  },
  paymentMethod,
  paymentStatus,
  stripePaymentId,
  createdAt
}`);

/**
 * Get recent orders (for admin dashboard)
 */
export const QUERY_RECENT_ORDERS = defineQuery(`*[
  _type == "order"
] | order(createdAt desc) [0...$limit] {
  _id,
  orderNumber,
  email,
  total,
  status,
  createdAt
}`);

/**
 * Check if order exists by Stripe payment ID
 * Used for webhook idempotency check
 */
export const QUERY_ORDER_BY_STRIPE_PAYMENT_ID = defineQuery(`*[
  _type == "order"
  && stripePaymentId == $stripePaymentId
][0]{
  _id,
  orderNumber,
  emailSent {
    admin,
    customer
  }
}`);

export const QUERY_ORDER_BY_STRIPE_SESSION_ID = defineQuery(`*[
  _type == "order"
  && stripeSessionId == $sessionId
][0] {
  _id,
  orderNumber,
  emailSent {
    admin,
    customer
  }
}`);
