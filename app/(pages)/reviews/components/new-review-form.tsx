"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ImagePlusIcon, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { submitReview } from "../actions";
import { client, clientOptions } from "@/sanity/lib/client";
import { REVIEW_PERMISSION_QUERY } from "@/sanity/queries/permission";
import { ClerkLoaded, ClerkLoading, useUser } from "@clerk/nextjs";
import { CONSULTATION_QUERY_RESULT } from "@/sanity.types";

export const NewReviewForm = ({
  consultations,
}: {
  consultations: CONSULTATION_QUERY_RESULT;
}) => {
  const { user } = useUser();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;
  const [hasPermission, setHasPermission] = React.useState<boolean>(true);

  const [isCustomSelected, setIsCustomSelected] =
    React.useState<boolean>(false);
  const [isSubmitting, startTransition] = React.useTransition();

  const form = useForm<ZSchemaType["review"]>({
    resolver: zodResolver(zSchema.review),
    defaultValues: {
      review: "",
      rating: "",
      service: "",
      customField: "",
      workAssets: [],
    },
  });

  async function onSubmit(values: ZSchemaType["review"]) {
    if (!hasPermission) {
      toast.info("Permission needed!", {
        description: `You do not have permission to submit a review. If you&apos;d like to
            submit a review, please send us an email at ${process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL}`,
      });
      return;
    }
    const data = {
      ...values,
      service:
        values.service === "custom" ? values.customField : values.service,
      rating: Number(values.rating),
    };
    toast.loading("Submitting review. Please wait..", {
      id: "submitting-review",
    });
    startTransition(async () => {
      const formData = new FormData();

      formData.append("review", data.review);
      formData.append("customField", String(data.customField));
      formData.append("service", String(data.service));
      formData.append("rating", String(data.rating));

      data.workAssets?.forEach((file) => {
        formData.append("workAssets", file);
      });

      // Directly call the server action
      const result = await submitReview(formData);
      toast.dismiss("submitting-review");

      if (result.success) {
        toast.success("Submission success!", {
          description: "It will be visible after approval.",
        });
        form.reset();
      } else {
        toast.error("Submission failed!", {
          description: result.error,
        });
      }
    });
  }

  React.useEffect(() => {
    if (form.watch("service") === "custom") {
      setIsCustomSelected(true);
    } else {
      setIsCustomSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("service")]);

  React.useEffect(() => {
    if (!customerEmail) return;

    (async () => {
      const result = await client.fetch(
        REVIEW_PERMISSION_QUERY,
        { email: customerEmail },
        clientOptions,
      );

      setHasPermission(Boolean(result));
    })();
  }, [customerEmail]);

  return (
    <div className="flex flex-col gap-10 py-24 lg:py-32">
      <Container size="xs" className="max-w-3xl">
        <div className="bg-card border-border rounded-md border p-6 shadow-xs md:p-8 lg:p-12">
          <ClerkLoading>
            <p className="max-w-lg text-sm font-medium">
              Checking permission status...
            </p>
          </ClerkLoading>

          <ClerkLoaded>
            {hasPermission && user ? (
              <>
                <h2 className="mb-1 font-serif text-xl md:text-2xl">
                  Leave a Review
                </h2>
                <p className="text-muted-foreground mb-8 text-sm font-normal">
                  Have thoughts to share? Let us know how we did.
                </p>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {isCustomSelected && (
                        <FormField
                          control={form.control}
                          name="customField"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom service</FormLabel>
                              <FormControl>
                                <InputGroup>
                                  <InputGroupInput
                                    {...field}
                                    disabled={isSubmitting}
                                    placeholder="Type in the service"
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      size="icon-sm"
                                      type="button"
                                      onClick={() =>
                                        form.setValue("service", "")
                                      }
                                    >
                                      <XIcon />
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                </InputGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {!isCustomSelected && (
                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required>Type of service</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="w-full"
                                    disabled={isSubmitting}
                                    aria-invalid={Boolean(
                                      form.formState.errors.service,
                                    )}
                                  >
                                    <SelectValue placeholder="Select service" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                  {[
                                    ...consultations.map((data) => ({
                                      value: data.title,
                                      label: data.title,
                                    })),
                                  ].map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value as string}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">Others</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Overall Rating</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className="w-full"
                                  disabled={isSubmitting}
                                  aria-invalid={Boolean(
                                    form.formState.errors.rating,
                                  )}
                                >
                                  <SelectValue placeholder="Select a rating" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                {[
                                  { value: "5", label: "★★★★★ – Excellent" },
                                  { value: "4", label: "★★★★☆ – Very Good" },
                                  { value: "3", label: "★★★☆☆ – Good" },
                                  { value: "2", label: "★★☆☆☆ – Fair" },
                                  { value: "1", label: "★☆☆☆☆ – Poor" },
                                ].map((rating) => (
                                  <SelectItem
                                    key={rating.value}
                                    value={rating.value}
                                  >
                                    {rating.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="review"
                      render={({ field }) => {
                        const currentLength = field.value?.length ?? 0;

                        return (
                          <FormItem>
                            <FormLabel required currentLength={currentLength}>
                              Write your Testimony
                            </FormLabel>

                            <FormControl>
                              <Textarea
                                {...field}
                                disabled={isSubmitting}
                                placeholder="Tell us about your experience.."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="workAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Add Photos you&apos;ve taken</FormLabel>
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onValueChange={field.onChange}
                              accept="image/*"
                              maxFiles={MAX_FILES_UPLOAD}
                              maxSize={MAX_SIZE_UPLOAD}
                              onFileValidate={(file: File): string | null => {
                                // Validate max files
                                if (
                                  field.value &&
                                  field.value.length >= MAX_FILES_UPLOAD
                                ) {
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
                                    Drag & drop files here
                                  </p>
                                  <p className="text-xs">
                                    Or click to browse (max {MAX_FILES_UPLOAD}{" "}
                                    files, up to{" "}
                                    {MAX_SIZE_UPLOAD / (1024 * 1024)}
                                    MB each)
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

                    <Button
                      size="xl"
                      isLoading={isSubmitting}
                      loadingText="Please wait..."
                      className="w-full"
                    >
                      Submit Review
                    </Button>
                  </form>
                </Form>
              </>
            ) : !user ? (
              <p className="max-w-lg text-sm font-medium text-blue-500">
                Please sign in to submit a review
              </p>
            ) : (
              <p className="text-destructive max-w-lg text-sm font-medium">
                You do not have permission to submit a review. If you&apos;d
                like to submit a review, please send us an email at{" "}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL}`}
                >
                  <strong className="underline">
                    {process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL}
                  </strong>
                </a>
              </p>
            )}
          </ClerkLoaded>
        </div>
      </Container>
    </div>
  );
};
