"use client";

import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";

import { schema } from "./sanity";
import { structure } from "./sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import {
  SanityInquiryAction,
  SanityOrderStatusAction,
} from "./sanity/lib/actions";

export default defineConfig({
  basePath: "/admin",
  projectId,
  dataset,
  schema,
  plugins: [
    colorInput(),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
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
      return prev;
    },
  },
});
