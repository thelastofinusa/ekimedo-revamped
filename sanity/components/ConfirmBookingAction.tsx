import React from "react";
import { useDocumentOperation } from "sanity";
import { useToast } from "@sanity/ui";
import { DocumentActionComponent, DocumentActionProps } from "sanity";

export const ConfirmBookingAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const { id, type, draft, published } = props;
  const { patch } = useDocumentOperation(id, type);
  const toast = useToast();

  const [loading, setLoading] = React.useState(false);

  // Safely get status
  const status =
    (draft?.status as string | undefined) ||
    (published?.status as string | undefined);

  // Only show when status is 'paid'
  if (status !== "paid") {
    return null;
  }

  const onHandle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }
      // Patch the document to reflect changes (if needed)
      patch.execute([{ set: { status: data.status } }]);
      toast.push({
        status: "success",
        title: "Booking confirmed",
        description: data.emailError
          ? "Email failed, status set to confirmed"
          : "Email sent, status set to delivered",
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
    label: loading ? "Confirming..." : "Confirm Booking",
    onHandle,
    tone: "positive",
    icon: () => null,
    disabled: loading,
  };
};
