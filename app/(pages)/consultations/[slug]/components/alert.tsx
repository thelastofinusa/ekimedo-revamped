"use client";
import * as React from "react";
import {
  QUERY_BOOKING_BY_ID_RESULT,
  QUERY_CONSULTATION_BY_SLUG_RESULT,
} from "@/sanity.types";
import { getBookingDetails } from "@/actions/consultation.action";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { CheckCircle2, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const BookingAlertDialog: React.FC<{
  type: "success" | "failed";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string;
  consultation: QUERY_CONSULTATION_BY_SLUG_RESULT;
  onClose: () => void;
  cancelMessage?: string;
}> = (props) => {
  const router = useRouter();
  const [booking, setBooking] =
    React.useState<QUERY_BOOKING_BY_ID_RESULT | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // For failure, skip loading and show dialog immediately
    if (props.type === "failed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    // For success, fetch booking details
    if (props.open && props.bookingId) {
      getBookingDetails(props.bookingId)
        .then((data) => setBooking(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [props.open, props.bookingId, props.type]);

  // If failure, don't show loading spinner at all
  if (props.type === "failed") {
    return (
      <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
        <AlertDialogContent className="gap-8 p-8 sm:max-w-md!">
          <div className="mx-auto flex flex-col items-center justify-center gap-2">
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 rounded-full size-16">
              <XCircleIcon className="size-6" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-center font-sans">
              Payment Cancelled
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-xs text-center">
              {props.cancelMessage ||
                "Your payment was not completed. You can try again."}
            </AlertDialogDescription>
          </div>

          <div className="border shadow-xs grid gap-4 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Consultation
              </span>
              <span className="text-foreground font-semibold">
                {props.consultation?.title || "N/A"}
              </span>
            </div>
          </div>

          <AlertDialogFooter className="flex-col gap-3 sm:flex-col">
            <AlertDialogCancel
              size="lg"
              variant="default"
              className="w-full sm:w-full"
              onClick={props.onClose}
            >
              Try Again
            </AlertDialogCancel>
            <AlertDialogCancel
              size="lg"
              variant="outline"
              className="w-full sm:w-full"
              onClick={props.onClose}
            >
              View Other Services
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Success case
  if (loading) {
    return (
      <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
        <AlertDialogContent className="gap-8 p-8 sm:max-w-md!">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (!booking) return null;

  const formatted =
    booking.dateTime &&
    new Date(booking.dateTime).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const details = [
    {
      label: "Consultation",
      value: booking.consultation?.title || props.consultation?.title || "N/A",
    },
    {
      label: "Date & Time",
      value: formatted,
    },
    {
      label: "Location",
      value:
        booking.formFields?.find((f) =>
          f.fieldLabel?.toLowerCase().includes("location"),
        )?.value || "Not specified",
    },
    { label: "Customer", value: booking.customerName || "Not provided" },
    {
      label: "Status",
      value: "Confirmed",
      className: "text-success font-semibold",
    },
  ];

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent className="gap-8 p-8 sm:max-w-md!">
        <div className="relative aspect-video w-full overflow-hidden shadow-xs border bg-secondary">
          {props.consultation?.image ? (
            <Image
              src={props.consultation.image}
              alt={props.consultation?.title || "Consultation"}
              fill
              className="object-cover"
              sizes="(max-width: 440px) 100vw, 440px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <div className="mx-auto flex flex-col items-center justify-center gap-2">
          <AlertDialogMedia className="bg-success/10 text-success dark:bg-success/20 rounded-full size-16">
            <CheckCircle2 className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center font-sans">
            Booking Confirmed!
          </AlertDialogTitle>
          <AlertDialogDescription className="max-w-xs text-center">
            Successfully booked {booking.consultation?.title || "consultation"}.
            You will receive a confirmation email shortly.
          </AlertDialogDescription>
        </div>

        <div className="shadow-xs border grid gap-4 p-4">
          {details.map(({ label, value, className }) => (
            <div
              key={label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground font-medium">{label}</span>
              <span className={cn("text-foreground font-semibold", className)}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            size="lg"
            variant="default"
            className="w-full sm:w-full"
            onClick={() => {
              props.onClose();
              router.push("/consultations");
            }}
          >
            Back to Consultations
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
