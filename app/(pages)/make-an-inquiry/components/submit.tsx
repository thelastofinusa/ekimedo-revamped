"use client";
import React, { useEffect } from "react";
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
  FileUploadList,
} from "@/components/shadcn/file-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Textarea } from "@/components/shadcn/textarea";
import { submitInquiryForm } from "@/actions/inquiry.action";
import { uploadFileToSanity, SanityAssetResult } from "@/lib/upload";
import { ClerkLoaded, ClerkLoading, Show, SignInButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { RiUser6Line } from "react-icons/ri";
import { Skeleton } from "@/components/shadcn/skeleton";

const STORAGE_KEY = "inquiryFormDraft";

function loadFormData(): Partial<ZSchemaType["inquiry"]> | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.eventDate) parsed.eventDate = new Date(parsed.eventDate);
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveFormData(data: Partial<ZSchemaType["inquiry"]>) {
  if (typeof window === "undefined") return; // SSR guard
  const { inspirationPhotos, ...rest } = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export const SubmitForm = () => {
  const pathname = usePathname();
  const savedData = loadFormData();

  const form = useForm<ZSchemaType["inquiry"]>({
    resolver: zodResolver(zSchema.inquiry),
    defaultValues: {
      fullName: savedData?.fullName || "",
      email: savedData?.email || "",
      phone: savedData?.phone || "",
      eventType: savedData?.eventType || "",
      eventDate: savedData?.eventDate || undefined,
      budget: savedData?.budget || undefined,
      dreamDress: savedData?.dreamDress || "",
      inspirationPhotos: [], // always start empty
    },
  });

  const [isSubmitting, startTransition] = React.useTransition();
  const [overallProgress, setOverallProgress] = React.useState(0);

  // ---------- Autosave to localStorage ----------
  const watchedFields = form.watch();

  useEffect(() => {
    // Save after a short debounce (every 500ms after last change)
    const timer = setTimeout(() => {
      saveFormData({
        fullName: watchedFields.fullName,
        email: watchedFields.email,
        phone: watchedFields.phone,
        eventType: watchedFields.eventType,
        eventDate: watchedFields.eventDate,
        budget: watchedFields.budget,
        dreamDress: watchedFields.dreamDress,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedFields]);

  // ---------- Helper functions ----------
  const getFileKey = React.useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  const onFileReject = React.useCallback((file: File, message: string) => {
    const truncatedName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
    toast.warning(message, {
      description: `"${truncatedName}" has been rejected`,
      duration: 8000,
    });
  }, []);

  const handleFileValueChange = React.useCallback(
    (newFiles: File[]) => {
      form.setValue("inspirationPhotos", newFiles, { shouldValidate: true });
    },
    [form],
  );

  // ---------- Submission logic ----------
  async function onSubmit(values: ZSchemaType["inquiry"]) {
    startTransition(async () => {
      try {
        const files = values.inspirationPhotos;

        // 1. Upload all files to Sanity (only on submit)
        const assetResults: SanityAssetResult[] = [];
        const errors: { file: File; error: Error }[] = [];
        let completed = 0;

        // Show initial loading toast
        toast.loading(`Uploading 0 of ${files.length} files. Please wait..`, {
          id: "file-upload",
        });

        const uploadPromises = files.map((file) =>
          uploadFileToSanity(file)
            .then((result) => {
              assetResults.push(result);
            })
            .catch((error) => {
              errors.push({ file, error });
            })
            .finally(() => {
              completed++;
              setOverallProgress(Math.round((completed / files.length) * 100));
              // Update the toast message
              toast.loading(
                `Uploading ${completed} of ${files.length} files...`,
                {
                  id: "file-upload",
                },
              );
            }),
        );

        await Promise.all(uploadPromises);
        setOverallProgress(0);
        toast.dismiss("file-upload");

        // 2. Handle upload errors
        if (errors.length > 0) {
          // Show a single error toast that summarizes failures
          const errorList = errors
            .map(({ file, error }) => `${file.name}: ${error.message}`)
            .join(", ");
          toast.error(
            `Failed to upload ${errors.length} file(s): ${errorList}`,
          );
          return;
        }
        // 3. Build asset references for the server action
        const assetRefs = assetResults.map(({ _id }) => ({
          _key: crypto.randomUUID(),
          _type: "asset" as const,
          asset: { _type: "reference" as const, _ref: _id },
        }));

        // 4. Submit the inquiry via server action
        toast.loading("Submitting inquiry...", { id: "submitting-inquiry" });
        const result = await submitInquiryForm(values, assetRefs);
        if (!result.success) throw new Error(result.message);

        toast.dismiss("submitting-inquiry");

        if (result.resendError) {
          toast.warning("Inquiry submitted successfully!", {
            description:
              "Your inquiry was submitted, but we couldn't notify the admin automatically.",
            duration: Infinity,
            closeButton: true,
          });
        } else {
          toast.success("Inquiry submitted successfully!", {
            description: result.message,
          });
        }

        // Inside startTransition callback after successful submission
        localStorage.removeItem(STORAGE_KEY);
        form.reset();
        form.reset({
          fullName: "",
          email: "",
          phone: "",
          eventType: "",
          eventDate: undefined,
          budget: undefined,
          dreamDress: "",
          inspirationPhotos: [],
        });
      } catch (error) {
        toast.dismiss("submitting-inquiry");
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
          { duration: Infinity, closeButton: true },
        );
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
            Fill out the form below and you&apos;ll get a response email within
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
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
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

              {/* Inspiration Photos – no onUpload, upload happens on submit */}
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
                            const key = getFileKey(file);
                            return (
                              <FileUploadItem
                                key={key}
                                value={file}
                                className="flex-col relative group"
                              >
                                <div className="flex w-full items-center gap-2">
                                  <FileUploadItemPreview />
                                  <FileUploadItemMetadata size="sm" />
                                  {!isSubmitting && (
                                    <FileUploadItemDelete
                                      asChild
                                      disabled={isSubmitting}
                                    >
                                      <Button
                                        variant="destructive"
                                        size="icon-xs"
                                        disabled={isSubmitting}
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

              <div className="relative">
                <ClerkLoading>
                  <Skeleton className="h-14" />
                </ClerkLoading>
                <ClerkLoaded>
                  <Show when="signed-in">
                    <Button
                      type="submit"
                      className="w-full"
                      size="xl"
                      disabled={isSubmitting || overallProgress > 0}
                      loadingText={
                        overallProgress > 0
                          ? `Uploading files ${overallProgress}%`
                          : "Please wait.."
                      }
                    >
                      Submit Inquiry
                    </Button>
                  </Show>
                  <Show when="signed-out" treatPendingAsSignedOut>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl={pathname}
                      fallbackRedirectUrl={pathname}
                      signUpForceRedirectUrl={pathname}
                      signUpFallbackRedirectUrl={pathname}
                    >
                      <Button className="w-full" size="xl" type="button">
                        <RiUser6Line className="size-4.5" />
                        <span>Sign in to Submit</span>
                      </Button>
                    </SignInButton>
                  </Show>
                </ClerkLoaded>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </div>
  );
};
