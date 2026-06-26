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
import { cn } from "@/lib/utils";
import {
  MAX_FILES_UPLOAD,
  MAX_SIZE_UPLOAD,
  zSchema,
  ZSchemaType,
} from "@/lib/zod";
import { QUERY_CONSULTATIONS_RESULT } from "@/sanity.types";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_REVIEW_PERMISSION } from "@/sanity/queries/permission.query";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  useUser,
} from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon, XIcon } from "lucide-react";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { submitReviewForm } from "@/actions/review.action";
import { usePathname } from "next/navigation";
import { SanityAssetResult, uploadFileToSanity } from "@/lib/upload";
import { Skeleton } from "@/components/shadcn/skeleton";
import { RiUser6Line } from "react-icons/ri";
import { Turnstile } from "@/components/shared/turnstile";

const STORAGE_KEY = "reviewFormDraft";

function loadFormData(): Partial<ZSchemaType["review"]> | null {
  if (typeof window === "undefined") return null;
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

function saveFormData(data: Partial<ZSchemaType["review"]>) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { workAssets, ...rest } = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export const SubmitForm: React.FC<{
  consultations: QUERY_CONSULTATIONS_RESULT;
}> = ({ consultations }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;

  const savedData = loadFormData();

  const form = useForm<ZSchemaType["review"]>({
    resolver: zodResolver(zSchema.review),
    defaultValues: {
      review: savedData?.review || "",
      rating: savedData?.rating || "",
      service: savedData?.service || "",
      customField: savedData?.customField || "",
      workAssets: [] as File[],
      captchaToken: "",
    },
  });

  const [isSubmitting, startTransition] = React.useTransition();
  const [overallProgress, setOverallProgress] = React.useState(0);
  const [hasPermission, setHasPermission] = React.useState(true);

  // Derived — no separate state needed
  const serviceValue = useWatch({ control: form.control, name: "service" });
  const captchaToken = useWatch({
    control: form.control,
    name: "captchaToken",
  });
  const isCustomSelected = serviceValue === "custom";

  // Autosave — watch only the fields that should be saved
  const review = useWatch({ control: form.control, name: "review" });
  const rating = useWatch({ control: form.control, name: "rating" });
  const customField = useWatch({ control: form.control, name: "customField" });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData({ review, rating, service: serviceValue, customField });
    }, 500);
    return () => clearTimeout(timer);
  }, [review, rating, serviceValue, customField]);

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
      form.setValue("workAssets", newFiles, { shouldValidate: true });
    },
    [form],
  );

  async function onSubmit(values: ZSchemaType["review"]) {
    if (!hasPermission) {
      toast.info("Permission needed!", {
        description: "You do not have permission to submit a review.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const files = values.workAssets;
        const assetResults: SanityAssetResult[] = [];
        const errors: { file: File; error: Error }[] = [];
        let completed = 0;
        let assetRefs: {
          _key: string;
          _type: "asset";
          asset: { _type: "reference"; _ref: string };
        }[] = [];

        if (files && files.length > 0) {
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
                setOverallProgress(
                  Math.round((completed / files.length) * 100),
                );
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

          if (errors.length > 0) {
            const errorList = errors
              .map(({ file, error }) => `${file.name}: ${error.message}`)
              .join(", ");
            toast.error(
              `Failed to upload ${errors.length} file(s): ${errorList}`,
            );
            return;
          }

          assetRefs = assetResults.map(({ _id }) => ({
            _key: crypto.randomUUID(),
            _type: "asset" as const,
            asset: { _type: "reference" as const, _ref: _id },
          }));
        }

        toast.loading("Submitting review. Please wait..", {
          id: "submitting-review",
        });

        const result = await submitReviewForm(values, assetRefs);
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

        localStorage.removeItem(STORAGE_KEY);
        form.reset({
          review: "",
          customField: "",
          rating: "",
          service: "",
          workAssets: [],
          captchaToken: "",
        });
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {isCustomSelected ? (
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
                      ) : (
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
                                  {consultations.map((data) => (
                                    <SelectItem
                                      key={data.title}
                                      value={data.title as string}
                                    >
                                      {data.title}
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
                                    Or click to browse (max {MAX_FILES_UPLOAD}{" "}
                                    files, up to{" "}
                                    {MAX_SIZE_UPLOAD / (1024 * 1024)}MB each)
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

                    <Turnstile
                      action="review"
                      disabled={form.formState.isSubmitting || isSubmitting}
                      onVerify={(token) => form.setValue("captchaToken", token)}
                      onExpire={() => form.setValue("captchaToken", "")}
                    />

                    {captchaToken && (
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
                              disabled={
                                !captchaToken ||
                                isSubmitting ||
                                overallProgress > 0
                              }
                              loadingText={
                                overallProgress > 0
                                  ? `Uploading files ${overallProgress}%`
                                  : isSubmitting
                                    ? "Please wait.."
                                    : undefined
                              }
                            >
                              Submit Review
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
                              <Button
                                className="w-full"
                                size="xl"
                                type="button"
                              >
                                <RiUser6Line className="size-4.5" />
                                <span>Sign in to Submit</span>
                              </Button>
                            </SignInButton>
                          </Show>
                        </ClerkLoaded>
                      </div>
                    )}
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
