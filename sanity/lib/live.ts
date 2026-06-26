// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { assertValue } from "@/lib/utils";

const sanityWriteToken = assertValue(
  process.env.SANITY_API_WRITE_TOKEN,
  "Missing environment variable: SANITY_API_WRITE_TOKEN",
);

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: sanityWriteToken,
  browserToken: false,
});
