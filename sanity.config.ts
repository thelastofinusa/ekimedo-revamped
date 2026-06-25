"use client";

import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { media } from "sanity-plugin-media";

import { schema } from "./sanity";
import { structure } from "./sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import {
  SanityInquiryAction,
  SanityOrderStatusAction,
  SanityReviewPermissionAction,
} from "./sanity/lib/actions";

export default defineConfig({
  basePath: "/admin",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    media(),
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((item) => item.templateId !== "businessHours");
      }
      return prev;
    },
    actions: (prev, context) => {
      if (context.schemaType === "inquiry") {
        return [...prev, SanityInquiryAction];
      }
      if (context.schemaType === "order") {
        return [...prev, SanityOrderStatusAction];
      }
      if (context.schemaType === "permission") {
        return [...prev, SanityReviewPermissionAction];
      }
      return prev;
    },
  },
});
