import { createClient, FilteredResponseQueryOptions } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: "published",
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  // token: process.env.SANITY_API_WRITE_TOKEN,
});

export const clientOptions: FilteredResponseQueryOptions = {
  next: { revalidate: 30 },
};
