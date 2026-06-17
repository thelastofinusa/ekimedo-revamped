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
import { bookConsultation } from "../actions";
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

export const BookingForm: React.FC<{
  consultation: CONSULTATION_BY_SLUG_QUERY_RESULT;
}> = ({ consultation }) => {
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

  const [isSubmitting, startTransition] = React.useTransition();

  async function onSubmit(values: FormSchemaType) {
    const loadId = `booking-${consultation?.title}`;
    toast.loading(`Booking ${consultation?.title}. Please wait..`, {
      id: loadId,
    });
    startTransition(async () => {
      // Directly call the server action
      const result = await bookConsultation(values);
      toast.dismiss(loadId);

      if (result.success) {
        toast.success("Booking successful", {
          description: "Your consultation has been booked successfully.",
        });
        form.reset();
      } else {
        toast.error("Submission failed!", {
          description: result.error,
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
                      {/* <RenderFormControl
                        form={form}
                        isSubmitting={isSubmitting}
                        data={data}
                        field={field}
                      /> */}
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
                  {/* <RenderFormControl
                        form={form}
                        isSubmitting={isSubmitting}
                        data={data}
                        field={field}
                      /> */}
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
      </React.Fragment>
    );
  };

  return (
    <div className="py-24 lg:py-32">
      <Container>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            <div className="columns-1 gap-4 space-y-4 md:columns-2 md:gap-5">
              {Array.isArray(consultation?.formCards) &&
              consultation?.formCards.length > 0 ? (
                consultation?.formCards.map((item) => {
                  if (!Array.isArray(item.fields) || item.fields.length < 1) {
                    return null;
                  }

                  return (
                    <div
                      key={item.id}
                      className="bg-card border-border mb-5 h-auto space-y-5 overflow-hidden rounded-md border p-6 shadow-xs md:p-8 xl:p-12"
                    >
                      <h2 className="mb-1 font-serif text-xl md:text-2xl">
                        {item.title}
                      </h2>
                      <p className="text-muted-foreground mb-8 text-sm font-normal">
                        {item.description}
                      </p>

                      {item.info && (
                        <Alert className="mb-8 w-full border-blue-500/80 bg-blue-500/5 text-blue-500">
                          <AlertTitle className="tracking-wider">
                            <span>{item.info}</span>
                          </AlertTitle>
                        </Alert>
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
                    <AlertTitle>Form configuration is unavailable.</AlertTitle>
                  </Alert>
                </div>
              )}

              <Button
                size="xl"
                isLoading={isSubmitting}
                loadingText="Processing Payment..."
              >
                Proceed to payment - {formatPrice(consultation?.price)}
              </Button>
            </div>
          </form>
        </Form>
      </Container>
    </div>
  );
};
