"use client";
import { Button } from "@/components/shadcn/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/shadcn/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/shadcn/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Textarea } from "@/components/shadcn/textarea";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { cn, validateFormSizeOrWarn } from "@/lib/utils";
import {
  MAX_FILES_UPLOAD,
  MAX_SIZE_UPLOAD,
  zSchema,
  ZSchemaType,
} from "@/lib/zod";
import { QUERY_CONSULTATIONS_RESULT } from "@/sanity.types";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_REVIEW_PERMISSION } from "@/sanity/queries/permission.query";
import { ClerkLoaded, ClerkLoading, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon, XIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitReviewForm } from "@/actions/review.action";

/**
 * Review submission form component
 */
export const SubmitForm: React.FC<{
  consultations: QUERY_CONSULTATIONS_RESULT;
}> = ({ consultations }) => {
  // Authentication and user data
  const { user } = useUser();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;

  // UI states
  const [isSubmitting, startTransition] = React.useTransition();
  const [isCustomSelected, setIsCustomSelected] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState(true);

  // Form setup
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

  /**
   * Toggle custom service input
   */
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    setIsCustomSelected(form.watch("service") === "custom");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("service")]);

  /**
   * Check if user has permission to submit reviews
   */
  React.useEffect(() => {
    if (!customerEmail) return;

    const checkPermission = async () => {
      const result = await client.fetch(
        QUERY_REVIEW_PERMISSION,
        { email: customerEmail },
        clientOptions,
      );
      setHasPermission(Boolean(result));
    };

    checkPermission();
  }, [customerEmail]);

  /**
   * Handle file rejection
   */
  const onFileReject = React.useCallback((file: File, message: string) => {
    const truncatedName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
    toast.warning(message, {
      description: `"${truncatedName}" has been rejected`,
      duration: 8000,
    });
  }, []);

  async function onSubmit(values: ZSchemaType["review"]) {
    if (!hasPermission) {
      toast.info("Permission needed!", {
        description: "You do not have permission to submit a review.",
      });
      return;
    }

    const formData = new FormData();

    formData.append("review", values.review);
    formData.append("customField", String(values.customField));
    formData.append("service", String(values.service));
    formData.append("rating", String(values.rating));

    values.workAssets?.forEach((file) => {
      formData.append("workAssets", file);
    });

    if (!validateFormSizeOrWarn({ formData })) return;

    toast.loading("Submitting review. Please wait..", {
      id: "submitting-review",
    });
    startTransition(async () => {
      try {
        const result = await submitReviewForm(formData);
        if (!result.success) throw new Error(result.message);

        if (result.resendError) {
          toast.warning("Review submitted successfully!", {
            description:
              "Your review was submitted and is awaiting approval, but we couldn't notify the admin automatically.",
            duration: Infinity,
            closeButton: true,
          });
        } else {
          toast.success("Review submitted successfully!", {
            description: result.message,
          });
        }
        form.reset();
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred", {
          description:
            error instanceof Error ? error.message : "Please try again",
          duration: Infinity,
          closeButton: true,
        });
      } finally {
        toast.dismiss("submitting-review");
      }
    });
  }

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
                    {/* Select Fields Container */}
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

                    {/* Textarea Field */}
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

                    {/* File Upload Field */}
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
                                    Or click to browse (max {MAX_FILES_UPLOAD}{" "}
                                    files, up to{" "}
                                    {MAX_SIZE_UPLOAD / (1024 * 1024)}
                                    MB each)
                                  </p>
                                </div>
                              </FileUploadDropzone>
                              <FileUploadList className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {field?.value?.map((file) => {
                                  const progressKey = `${file.name}-${file.size}`;

                                  return (
                                    <FileUploadItem
                                      key={progressKey}
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
                <a href={`mailto:${siteConfig.supportEmail}`}>
                  <strong className="underline">
                    {siteConfig.supportEmail}
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
