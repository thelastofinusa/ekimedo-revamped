import React from "react";
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionProps,
} from "sanity";
import { useToast } from "@sanity/ui";

// ! INQUIRY ACTION
const SanityInquiryAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const toast = useToast();
  const { id, type, draft, published } = props;
  const { patch } = useDocumentOperation(id, type);

  const [loading, setLoading] = React.useState(false);

  const status =
    (draft?.status as string | undefined) ||
    (published?.status as string | undefined);

  // Only show if status exists, is not pending
  if (status && status !== "pending") return null;

  const onHandle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/sanity/actions/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      patch.execute([{ set: { status: data.status } }]);

      toast.push({
        status: "success",
        title: "Email sent successfully",
        description: "Inquiry confirmation email sent successfully",
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
    label: loading ? "Please wait.." : "Send Inquiry Confirmation",
    onHandle,
    tone: "primary",
    disabled: loading,
  };
};

const SanityOrderStatusAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const { id, type, draft, published } = props;
  const { patch } = useDocumentOperation(id, type);
  const toast = useToast();

  const [loading, setLoading] = React.useState(false);

  // Get status from draft or published
  const status = (draft?.status as string) || (published?.status as string);

  // Only show if status exists, is not pending, and not cancelled
  if (!status || status === "pending") return null;

  const onHandle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/sanity/actions/order/status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: id }),
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

const SanityReviewPermissionAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const toast = useToast();
  const { id } = props;

  // const { delete: deleteOperation } = useDocumentOperation(id, props.type);

  const [loading, setLoading] = React.useState(false);

  const onHandle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/sanity/actions/review-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionId: id,
        }),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to send review invitation");

      toast.push({
        status: "success",
        title: "Review invitation sent",
        description:
          "The customer has been granted permission to submit a testimonial.",
      });

      // Remove permission record after successful email
      // deleteOperation.execute();
    } catch (error) {
      toast.push({
        status: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    label: loading ? "Sending..." : "Send Review Invitation",
    onHandle,
    tone: "primary",
    disabled: loading,
  };
};

export {
  SanityInquiryAction,
  SanityOrderStatusAction,
  SanityReviewPermissionAction,
};
