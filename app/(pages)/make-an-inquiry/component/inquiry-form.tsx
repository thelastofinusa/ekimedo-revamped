"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Container } from "@/components/shared/container";
import {
  MAX_FILES_UPLOAD,
  MAX_SIZE_UPLOAD,
  zSchema,
  ZSchemaType,
} from "@/lib/validators";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_TYPES } from "@/constants/others";
import { formatDateTimeLocal, parseDateTimeLocal } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/ui/file-upload";
import { ImagePlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { submitContactInquiry } from "../actions";

export const InquiryForm = () => {
  const [isSubmitting, startTransition] = React.useTransition();

  const form = useForm<ZSchemaType["inquiry"]>({
    resolver: zodResolver(zSchema.inquiry),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: undefined,
      budget: undefined,
      inspirationPhotos: [] as File[],
      dreamDress: "",
    },
  });

  async function onSubmit(values: ZSchemaType["inquiry"]) {
    const formData = new FormData();

    // Append all text fields
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("eventType", values.eventType);
    formData.append(
      "eventDate",
      values.eventDate ? values.eventDate.toISOString() : "",
    );
    formData.append("budget", String(values.budget));
    formData.append("dreamDress", values.dreamDress);

    // Append files
    if (values.inspirationPhotos) {
      for (const file of values.inspirationPhotos) {
        formData.append("inspirationPhotos", file);
      }
    }

    toast.loading("Submitting inquiry. Please wait..", {
      id: "submitting-inquiry",
    });

    startTransition(async () => {
      const result = await submitContactInquiry(formData);
      toast.dismiss("submitting-inquiry");

      if (result.success) {
        toast.success("Inquiry submitted successfully", {
          description:
            "Thank you for your custom order inquiry. We will get back to you within 24-48 hours.",
        });
        form.reset();
      } else {
        toast.error("Submission failed!", {
          description: result.error,
        });
      }
    });
  }

  return (
    <div className="py-24 lg:py-32">
      <Container size="xs" className="max-w-3xl">
        <div className="bg-card border-border rounded-md border p-6 shadow-xs md:p-8 lg:p-12">
          <h2 className="mb-1 font-serif text-xl md:text-2xl">
            Tell Us About Your Vision
          </h2>
          <p className="text-muted-foreground mb-8 text-sm font-normal">
            Fill out the form below and you&apos;ll get a response email withing
            24-48 hours
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email & Phone */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g. your@email.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          disabled={isSubmitting}
                          defaultCountry="US"
                          placeholder="+1 (555) 000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Event Type & Date */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Event Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel required>Event Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isSubmitting}
                          min={formatDateTimeLocal(new Date())}
                          value={formatDateTimeLocal(field.value)}
                          onChange={(e) => {
                            const date = parseDateTimeLocal(e.target.value);
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Estimated Budget</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          placeholder="e.g. $5,000"
                          className="flex-1"
                          disabled={isSubmitting}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                        <Link
                          href="/pricing"
                          className={buttonVariants({
                            variant: "default",
                            size: "lg",
                          })}
                        >
                          Our Pricing
                        </Link>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inspirationPhotos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Inspiration Photos</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onValueChange={field.onChange}
                        accept="image/*"
                        maxFiles={MAX_FILES_UPLOAD}
                        maxSize={MAX_SIZE_UPLOAD}
                        onFileValidate={(file: File): string | null => {
                          // Validate max files
                          if (field.value.length >= MAX_FILES_UPLOAD) {
                            return `You can only upload up to ${MAX_FILES_UPLOAD} files`;
                          }

                          // Validate file type (only images)
                          if (!file.type.startsWith("image/")) {
                            return "Only image files are allowed";
                          }

                          if (file.size > MAX_SIZE_UPLOAD) {
                            return `File size must be less than ${MAX_SIZE_UPLOAD / (1024 * 1024)}MB`;
                          }

                          return null;
                        }}
                        onFileReject={(file: File, message: string) => {
                          toast.error(message, {
                            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
                          });
                        }}
                        multiple
                      >
                        <FileUploadDropzone
                          className={cn(
                            field.value.length >= MAX_FILES_UPLOAD ||
                              isSubmitting
                              ? "pointer-events-none cursor-not-allowed opacity-50"
                              : "",
                          )}
                        >
                          <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
                            <ImagePlusIcon className="size-8" />

                            <p className="mt-4 text-sm font-medium">
                              Drag & drop files here
                            </p>
                            <p className="text-xs">
                              Or click to browse (max {MAX_FILES_UPLOAD} files,
                              up to {MAX_SIZE_UPLOAD / (1024 * 1024)}MB each)
                            </p>
                          </div>
                        </FileUploadDropzone>
                        <FileUploadList
                          orientation="horizontal"
                          className="grid grid-cols-3 gap-3 md:grid-cols-5"
                        >
                          {field.value?.map((file, index) => (
                            <FileUploadItem
                              key={index}
                              value={file}
                              className="group p-0"
                            >
                              <FileUploadItemPreview
                                className={cn(
                                  "aspect-square size-full! overflow-hidden",
                                  isSubmitting &&
                                    "pointer-events-none opacity-60",
                                )}
                              />
                              <FileUploadItemMetadata className="sr-only" />
                              {!isSubmitting && (
                                <FileUploadItemDelete asChild>
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="destructive"
                                    disabled={isSubmitting}
                                    className="absolute top-1 right-1 opacity-0 transition-opacity md:group-hover:opacity-100"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </FileUploadItemDelete>
                              )}
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                      </FileUpload>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dream Dress Description */}
              <FormField
                control={form.control}
                name="dreamDress"
                render={({ field }) => {
                  const currentLength = field.value?.length ?? 0;

                  return (
                    <FormItem>
                      <FormLabel required currentLength={currentLength}>
                        Describe Your Dream Dress
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          disabled={isSubmitting}
                          placeholder="Share any ideas, inspirations, or special details."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="xl"
                isLoading={isSubmitting}
                loadingText="Submitting..."
              >
                Submit Inquiry
              </Button>
            </form>
          </Form>
        </div>
      </Container>
    </div>
  );
};
