// sanity/components/EmailPreviewPane.tsx
"use client";
import React from "react";

export function EmailPreviewPane({ documentId }: { documentId: string }) {
  return (
    <iframe
      src={`/api/email-template-preview?id=${documentId}`}
      title="Email preview"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "#fff",
      }}
    />
  );
}
