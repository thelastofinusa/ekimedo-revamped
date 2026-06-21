import React from "react";
import { useDocumentOperation } from "sanity";
import { useToast } from "@sanity/ui";
import { DocumentActionComponent, DocumentActionProps } from "sanity";

export const OrderStatusAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const { id, type, draft, published } = props;
  const { patch } = useDocumentOperation(id, type);
  const toast = useToast();

  const [loading, setLoading] = React.useState(false);

  // Get status from draft or published
  const status =
    (draft?.status as string | undefined) ||
    (published?.status as string | undefined);

  // Only show if status exists, is not pending, and not cancelled
  if (!status || status === "pending" || status === "cancelled") {
    return null;
  }

  const onHandle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/order/status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send status email");
      }
      // Patch the document to reflect changes (if needed)
      patch.execute([{ set: { status: data.status } }]);
      toast.push({
        status: "success",
        title: "Status email sent",
        description: `Email sent to customer about order status: ${status}`,
      });
    } catch (error) {
      toast.push({
        status: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    label: loading ? "Sending..." : "Send Status Email",
    onHandle,
    tone: "primary",
    disabled: loading,
  };
};
