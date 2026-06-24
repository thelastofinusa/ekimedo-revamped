"use client";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import {
  Consultation,
  FormCard,
  QUERY_CONSULTATION_BY_SLUG_RESULT,
  FormField as SchemaFormField,
} from "@/sanity.types";
import React from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { RenderControl } from "./render";
import Link from "next/link";
import { Route } from "next";
import { Container } from "@/components/shared/container";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildDefaultValues, buildZodSchema } from "@/lib/consultation";
import z from "zod";
import { BsInfoCircleFill } from "react-icons/bs";
import { Alert, AlertTitle } from "@/components/shadcn/alert";
import { formatPrice } from "@/lib/format";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group";
import { PAYMENT_METHODS, PAYMENT_METHODS_TYPE } from "@/constants/others";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";
import {
  bookConsultation,
  getAvailableTimes,
} from "@/actions/consultation.action";
import { usePathname, useRouter } from "next/navigation";
import { BookingAlertDialog } from "./alert";

export const SubmitForm: React.FC<{
  consultation: QUERY_CONSULTATION_BY_SLUG_RESULT;
  paymentStatus?: "success" | "failed" | null;
  cancelMessage?: string;
  bookingId?: string;
}> = ({ consultation, cancelMessage, paymentStatus, bookingId }) => {
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
    paymentStatus === "success" || paymentStatus === "failed",
  );
  const [isSubmitting, startTransition] = React.useTransition();
  const [paymentMethod, setPaymentMethod] =
    React.useState<PAYMENT_METHODS_TYPE["id"]>("card");

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

  // Close dialog when user clicks action button
  const handleDialogClose = () => {
    setDialogOpen(false);
    clearQueryParams();
  };

  const watchedValues = useWatch({ control: form.control });
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
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPaymentMethod(parsed.paymentMethod);
        }
      } catch (e) {
        console.error("Failed to load saved form data", e);
      }
    }
  }, [consultation?.slug, form]);

  // Save form data to localStorage on changes
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

  async function onSubmit(values: FormSchemaType) {
    toast.loading("Processing payment. Please wait..", { id: "booking" });
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
        if (result.success && result.url) {
          window.location.href = result.url;
          if (paymentStatus === "success") {
            localStorage.removeItem(`booking-form-${consultation?.slug}`);
            form.reset();
          }
        } else {
          toast.error("Failed to create booking", {
            description: result.message || "Please try again.",
            duration: Infinity,
            closeButton: true,
          });
        }
      } catch (error) {
        toast.dismiss("booking");
        toast.error("Something went wrong", {
          description: error instanceof Error ? error.message : "Unknown error",
          duration: Infinity,
          closeButton: true,
        });
      }
    });
  }

  return (
    <>
      {paymentStatus === "success" && bookingId && (
        <BookingAlertDialog
          type="success"
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          bookingId={bookingId}
          consultation={consultation}
          onClose={handleDialogClose}
          cancelMessage={cancelMessage}
        />
      )}
      {paymentStatus === "failed" && (
        <BookingAlertDialog
          type="failed"
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          bookingId={bookingId}
          consultation={consultation}
          onClose={handleDialogClose}
          cancelMessage={cancelMessage}
        />
      )}
      <div className="py-24 lg:py-32">
        <Container>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 md:gap-5"
            >
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
                          consultation,
                          item.fields as unknown as FormCard["fields"],
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
                        onValueChange={(value) =>
                          setPaymentMethod(value as PAYMENT_METHODS_TYPE["id"])
                        }
                        disabled={isSubmitting}
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <FormLabel
                            htmlFor={method.id}
                            key={method.id}
                            className={cn(
                              "border-input has-data-[state=checked]:border-primary has-focus-visible:border-ring has-focus-visible:ring-ring relative flex w-full cursor-pointer items-start gap-2 rounded-md border p-5 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-2",
                              {
                                "border-destructive": !paymentMethod,
                                "pointer-events-none opacity-50":
                                  isSubmitting || !method.isAvailable,
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
                                  {!method.isAvailable && "(Coming soon)"}
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
    </>
  );
};

const renderFieldsWithGroups = (
  consultation: QUERY_CONSULTATION_BY_SLUG_RESULT,
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
                    <FormLabel required={data.required}>{data.label}</FormLabel>
                    <RenderControl
                      form={form}
                      isSubmitting={isSubmitting}
                      data={data}
                      field={field}
                      consultationSlug={consultation?.slug as string}
                      getAvailability={getAvailableTimes}
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
