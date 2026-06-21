"use client";
import z from "zod";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";

import {
  Consultation,
  CONSULTATION_BY_SLUG_QUERY_RESULT,
  FormCard,
  FormField as SchemaFormField,
} from "@/sanity.types";
import { buildDefaultValues, buildZodSchema } from "@/lib/consultation";
import { toast } from "sonner";
import { bookConsultation, updateBookingWithSessionId } from "../actions";
import { Container } from "@/components/shared/container";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Route } from "next";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { CheckCircle2, ChevronLeftIcon, XCircle } from "lucide-react";
import { RenderControl } from "./render-control";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { preferredPaymentMethod } from "@/constants/consultation";
import { createCheckoutSession } from "../checkout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePathname, useRouter } from "next/navigation";
import { BsInfoCircleFill } from "react-icons/bs";

export const BookingForm: React.FC<{
  consultation: CONSULTATION_BY_SLUG_QUERY_RESULT;
  paymentStatus?: "success" | "cancel" | "error" | null;
  bookingId?: string | null;
  consultationTitle?: string | null;
}> = ({ consultation, paymentStatus, consultationTitle }) => {
  const router = useRouter();
  const pathname = usePathname();

  const formSchema = buildZodSchema(
    consultation?.formCards as Consultation["formCards"],
  );
  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(
      consultation?.formCards as Consultation["formCards"],
    ),
  });

  const [dialogOpen, setDialogOpen] = React.useState(
    paymentStatus === "success" ||
      paymentStatus === "cancel" ||
      paymentStatus === "error",
  );
  const [isSubmitting, startTransition] = React.useTransition();
  const [paymentMethod, setPaymentMethod] =
    React.useState<(typeof preferredPaymentMethod)[number]["id"]>("stripe");

  // Clear payment-related query params from the URL
  const clearQueryParams = React.useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("payment");
    params.delete("session_id");
    params.delete("booking_id");
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl as Route, { scroll: false });
  }, [pathname, router]);

  // Load saved data from localStorage on mount
  React.useEffect(() => {
    const STORAGE_KEY = `booking-form-${consultation?.slug}`;
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Revive date strings to Date objects if they look like dates
        const revived = Object.entries(parsed).reduce(
          (acc, [key, value]) => {
            if (
              typeof value === "string" &&
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
            ) {
              acc[key] = new Date(value);
            } else {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, unknown>,
        );

        form.reset(revived);

        if (parsed.paymentMethod) {
          setPaymentMethod(parsed.paymentMethod);
        }
      } catch (e) {
        console.error("Failed to load saved form data", e);
      }
    }
  }, [consultation?.slug, form]);

  // Save form data to localStorage on changes
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = form.watch();
  React.useEffect(() => {
    const STORAGE_KEY = `booking-form-${consultation?.slug}`;
    const dataToSave = {
      ...watchedValues,
      paymentMethod,
    };

    // Filter out File objects as they can't be serialized
    const serializableData = Object.entries(dataToSave).reduce(
      (acc, [key, value]) => {
        const isFile = (v: unknown): v is File =>
          v instanceof File ||
          (typeof v === "object" && v !== null && "name" in v && "size" in v);

        if (isFile(value)) return acc;
        if (Array.isArray(value)) {
          acc[key] = value.filter((v) => !isFile(v));
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableData));
  }, [watchedValues, paymentMethod, consultation?.slug]);

  // Close dialog when user clicks action button
  const handleDialogClose = () => {
    setDialogOpen(false);
    clearQueryParams();
  };

  // Inside onSubmit

  async function onSubmit(values: FormSchemaType) {
    toast.loading("Preparing your booking...", { id: "booking" });
    const payload = {
      ...values,
      consultationSlug: consultation?.slug,
      dateTime: values.consultationDate,
      paymentMethod,
    };

    startTransition(async () => {
      try {
        const result = await bookConsultation(payload);
        toast.dismiss("booking");

        if (!result.success) {
          toast.error("Booking failed", { description: result.error });
          form.setValue(payload.dateTime as string, "");
          return;
        }

        // If payment method is Stripe, create checkout session
        if (paymentMethod === "stripe") {
          toast.loading("Redirecting to payment...", { id: "payment" });
          const { sessionId, sessionUrl, error } = await createCheckoutSession(
            result.bookingId!,
            result.consultationTitle!,
            result.amount!,
            result.customerEmail!,
            consultation?.slug as string,
          );
          toast.dismiss("payment");
          if (error) {
            toast.error("Payment initialization failed", {
              description: error,
            });
            return;
          }

          // Redirect to Stripe
          if (sessionUrl) {
            // Save the Stripe session ID on the booking
            await updateBookingWithSessionId(result.bookingId!, sessionId);
            window.location.href = sessionUrl;
            localStorage.removeItem(`booking-form-${consultation?.slug}`);
            form.reset();
          }
        }
      } catch (error) {
        toast.dismiss("booking");
        toast.error("Something went wrong", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  const renderFieldsWithGroups = (
    fields: FormCard["fields"],
    form: UseFormReturn,
    isSubmitting: boolean,
  ) => {
    const groups: Record<string, unknown[]> = {};
    const standalone: unknown[] = [];

    fields?.forEach((field) =>
      field.group
        ? (() => {
            groups[field.group] ??= [];
            groups[field.group].push(field);
          })()
        : standalone.push(field),
    );

    return (
      <React.Fragment>
        {Object.entries(groups).map(([group, groupFields]) => (
          <div
            key={group}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2"
          >
            {groupFields.map((f) => {
              const data = f as {
                label: string;
                description?:
                  | string
                  | { path: string; value: string; newTab?: boolean };
              } & SchemaFormField;

              return (
                <FormField
                  key={data.name}
                  control={form.control}
                  name={data.name as string}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={data.required}>
                        {data.label}
                      </FormLabel>
                      <RenderControl
                        form={form}
                        isSubmitting={isSubmitting}
                        data={data}
                        field={field}
                        consultationSlug={consultation?.slug as string}
                      />
                      <FormMessage />
                      {data.description &&
                        (typeof data.description === "string" ? (
                          <FormDescription className="mt-2">
                            {data.description}
                          </FormDescription>
                        ) : data.description.path ? (
                          <Link
                            href={data.description.path as Route}
                            target={
                              data.description.newTab ? "_blank" : "_parent"
                            }
                            className="mt-2"
                          >
                            <FormDescription className="font-medium underline">
                              {data.description.value}
                            </FormDescription>
                          </Link>
                        ) : (
                          <FormDescription className="mt-2">
                            {data.description.value}
                          </FormDescription>
                        ))}
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        ))}

        {standalone.map((f) => {
          const data = f as {
            label: string;
            description?:
              | string
              | { path: string; value: string; newTab?: boolean };
          } & SchemaFormField;

          return (
            <FormField
              key={data.name}
              control={form.control}
              name={data.name as string}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={data.required}>{data.label}</FormLabel>
                  <RenderControl
                    form={form}
                    isSubmitting={isSubmitting}
                    data={data}
                    field={field}
                    consultationSlug={consultation?.slug as string}
                  />
                  <FormMessage />
                  {data.description &&
                    (typeof data.description === "string" ? (
                      <FormDescription className="mt-2">
                        {data.description}
                      </FormDescription>
                    ) : data.description.path ? (
                      <Link
                        href={data.description.path as Route}
                        target={data.description.newTab ? "_blank" : "_parent"}
                        className="mt-2 w-max"
                      >
                        <FormDescription className="font-medium underline">
                          {data.description.value}
                        </FormDescription>
                      </Link>
                    ) : (
                      <FormDescription className="mt-2">
                        {data.description.value}
                      </FormDescription>
                    ))}
                </FormItem>
              )}
            />
          );
        })}
      </React.Fragment>
    );
  };

  // Render dialog based on status
  const renderDialog = () => {
    if (paymentStatus === "success") {
      return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-600" />
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription>
                Your consultation booking has been successfully confirmed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                We&apos;ve sent a confirmation email to your inbox with all the
                details concerning <strong>{consultationTitle}</strong>
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={handleDialogClose}>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (paymentStatus === "cancel") {
      return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="size-4 text-red-600" />
                Payment Cancelled
              </DialogTitle>
              <DialogDescription>
                You cancelled the payment. Your booking is not confirmed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                You can try again or choose a different payment method.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleDialogClose}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (paymentStatus === "error") {
      return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="size-4 text-red-600" />
                Payment Error
              </DialogTitle>
              <DialogDescription>
                Something went wrong while processing your payment. Please try
                again.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={handleDialogClose}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  return (
    <>
      <div className="py-24 lg:py-32">
        <Container>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 md:gap-5"
            >
              <Link
                href="/book-consultation"
                className="flex w-max cursor-pointer items-center gap-2"
              >
                <ChevronLeftIcon className="size-4" />
                <span className="text-sm font-medium">
                  Back to Consultation Page
                </span>
              </Link>
              <div className="columns-1 gap-4 space-y-4 md:columns-2 md:gap-5">
                {Array.isArray(consultation?.formCards) &&
                consultation?.formCards.length > 0 ? (
                  consultation?.formCards.map((item, index) => {
                    if (!Array.isArray(item.fields) || item.fields.length < 1) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        className="bg-card border-border mb-5 h-auto space-y-5 overflow-hidden rounded-md border p-6 shadow-xs md:p-8 xl:p-12"
                      >
                        <h2 className="mb-1 font-serif text-xl md:text-2xl">
                          {item.title}
                        </h2>
                        <p className="text-muted-foreground mb-7 text-sm font-normal">
                          {item.description}
                        </p>

                        {item.info && (
                          <div className="text-primary mb-8 flex items-start gap-2">
                            <BsInfoCircleFill className="mt-0.5 size-4" />
                            <p className="flex-1 text-[13px] font-medium">
                              {item.info}
                            </p>
                          </div>
                        )}

                        {renderFieldsWithGroups(
                          item.fields as FormCard["fields"],
                          form,
                          isSubmitting,
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-card border-border mb-5 h-auto space-y-5 overflow-hidden rounded-md border p-6 text-sm shadow-xs md:p-8 xl:p-12">
                    <Alert className="border-destructive/80 bg-destructive/5 text-destructive w-full max-w-lg">
                      <AlertTitle>
                        Form configuration is unavailable.
                      </AlertTitle>
                    </Alert>
                  </div>
                )}

                <div className="mb-5 flex flex-col gap-5">
                  <div className="bg-card border-border h-auto space-y-5 overflow-hidden rounded-md border p-6 shadow-xs md:p-8 xl:p-12">
                    <h2 className="mb-1 font-serif text-xl md:text-2xl">
                      Payment Method
                    </h2>
                    <p className="text-muted-foreground mb-8 text-sm font-normal">
                      Booking fee of{" "}
                      <strong>{formatPrice(consultation?.price)}</strong> is{" "}
                      <strong>Nonrefundable!</strong>
                    </p>

                    <div className="grid gap-1">
                      <RadioGroup
                        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2"
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value)}
                        disabled={isSubmitting}
                      >
                        {preferredPaymentMethod.map((method) => (
                          <FormLabel
                            htmlFor={method.id}
                            key={method.id}
                            className={cn(
                              "border-input has-data-[state=checked]:border-primary has-focus-visible:border-ring has-focus-visible:ring-ring relative flex w-full cursor-pointer items-start gap-2 rounded-md border p-5 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-2",
                              {
                                "border-destructive": !paymentMethod,
                                "pointer-events-none opacity-50":
                                  isSubmitting || method.disabled,
                              },
                            )}
                          >
                            <RadioGroupItem
                              value={method.id}
                              id={method.id}
                              className="sr-only"
                              disabled={isSubmitting}
                            />
                            <div className="text-foreground flex flex-col items-start gap-2">
                              <div className="flex w-full items-center gap-2">
                                <method.icon className="size-4" />
                                <span className="text-[11px]">
                                  {method.label}{" "}
                                  {method.disabled && "(Coming soon)"}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </FormLabel>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                  <Button
                    size="xl"
                    isLoading={isSubmitting}
                    loadingText={"Processing payment.."}
                  >
                    Proceed to payment - {formatPrice(consultation?.price)}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Container>
      </div>
      {renderDialog()}
    </>
  );
};
