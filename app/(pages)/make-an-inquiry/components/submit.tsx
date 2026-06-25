"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Container } from "@/components/shared/container";
import {
  MAX_FILES_UPLOAD,
  MAX_SIZE_UPLOAD,
  zSchema,
  ZSchemaType,
} from "@/lib/zod";
import { Input } from "@/components/shadcn/input";
import { PhoneInput } from "@/components/shadcn/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { EVENT_TYPES } from "@/constants/others";
import { formatDateTimeLocal, parseDateTimeLocal } from "@/lib/format";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/shadcn/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
} from "@/components/shadcn/file-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Textarea } from "@/components/shadcn/textarea";
import { submitInquiryForm } from "@/actions/inquiry.action";
import { useFileUpload } from "@/hooks/use-file-upload";

export const SubmitForm = () => {
  const form = useForm<ZSchemaType["inquiry"]>({
    resolver: zodResolver(zSchema.inquiry),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: undefined,
      budget: undefined,
      dreamDress: "",
      inspirationPhotos: [] as File[],
    },
  });

  const {
    onFileUpload,
    getFileKey,
    setFileBlobMap,
    isFileUploading,
    fileBlobMap,
    onFileReject,
    handleFileValueChange,
  } = useFileUpload({
    getFiles: () => form.getValues("inspirationPhotos"),
    setFiles: (files) =>
      form.setValue("inspirationPhotos", files, { shouldValidate: true }),
  });

  const [isSubmitting, startTransition] = React.useTransition();

  // ---- MODIFIED onSubmit: sends blob URLs instead of raw files ----
  async function onSubmit(values: ZSchemaType["inquiry"]) {
    // Prevent submission while uploads are still in progress
    if (isFileUploading) {
      toast.error("Please wait for file uploads to finish.");
      return;
    }

    // Collect blob URLs from state
    const inspirationUrls = values.inspirationPhotos
      .map((file) => fileBlobMap[getFileKey(file)]?.url)
      .filter(Boolean) as string[];

    toast.loading("Submitting inquiry. Please wait...", {
      id: "submitting-inquiry",
    });

    startTransition(async () => {
      try {
        const result = await submitInquiryForm(values, inspirationUrls);
        if (!result.success) throw new Error(result.message);

        if (result.resendError) {
          toast.warning("Inquiry submitted successfully!", {
            description:
              "Your review was submitted and is awaiting approval, but we couldn't notify the admin automatically.",
            duration: Infinity,
            closeButton: true,
          });
        } else {
          toast.success("Inquiry submitted successfully!", {
            description: result.message,
          });
        }

        form.reset();
        setFileBlobMap({});
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred", {
          description:
            error instanceof Error ? error.message : "Please try again",
          duration: Infinity,
          closeButton: true,
        });
      } finally {
        toast.dismiss("submitting-inquiry");
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
                        value={field.value}
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
                              {type.title}
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
                        />
                        <Link
                          href={isSubmitting ? "#" : "/pricing"}
                          className={buttonVariants({
                            variant: "default",
                            size: "lg",
                            className:
                              isSubmitting && "pointer-events-none opacity-50",
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

              {/* Inspiration Photos – modified to use our custom onChange */}
              <FormField
                control={form.control}
                name="inspirationPhotos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Inspiration Photos</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onValueChange={handleFileValueChange}
                        accept="image/png,image/jpeg"
                        maxFiles={MAX_FILES_UPLOAD}
                        maxSize={MAX_SIZE_UPLOAD}
                        onFileReject={onFileReject}
                        onUpload={onFileUpload}
                        multiple
                      >
                        <FileUploadDropzone
                          className={cn(
                            (field.value &&
                              field.value?.length >= MAX_FILES_UPLOAD) ||
                              isSubmitting
                              ? "pointer-events-none cursor-not-allowed opacity-50"
                              : "",
                          )}
                        >
                          {/* dropzone content unchanged */}
                          <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
                            <ImagePlusIcon className="size-8" />
                            <p className="mt-4 text-sm font-medium">
                              Drag & drop files here.
                            </p>
                            <p className="text-xs">
                              Or click to browse (max {MAX_FILES_UPLOAD} files,
                              up to {MAX_SIZE_UPLOAD / (1024 * 1024)}
                              MB each)
                            </p>
                          </div>
                        </FileUploadDropzone>
                        <FileUploadList className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {field?.value?.map((file) => {
                            const key = getFileKey(file); // use the stable key
                            return (
                              <FileUploadItem
                                key={key}
                                value={file}
                                className="flex-col relative group"
                              >
                                <div className="flex w-full items-center gap-2">
                                  <FileUploadItemPreview />
                                  <FileUploadItemMetadata size="sm" />
                                  <FileUploadItemProgress variant="fill" />
                                  {!isSubmitting && (
                                    <FileUploadItemDelete
                                      asChild
                                      disabled={isSubmitting || isFileUploading}
                                    >
                                      <Button
                                        variant="destructive"
                                        size="icon-xs"
                                        disabled={
                                          isSubmitting || isFileUploading
                                        }
                                        className="md:opacity-30 md:pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
                                      >
                                        <XIcon />
                                      </Button>
                                    </FileUploadItemDelete>
                                  )}
                                </div>
                              </FileUploadItem>
                            );
                          })}
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

              <Button
                type="submit"
                className="w-full"
                size="xl"
                isLoading={isSubmitting}
                loadingText="Submitting..."
                disabled={isFileUploading || isSubmitting}
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
