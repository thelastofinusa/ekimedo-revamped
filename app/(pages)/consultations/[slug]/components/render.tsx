/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { FieldOption, FormField } from "@/sanity.types";
import { FormControl, FormLabel } from "@/components/shadcn/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/shadcn/input-group";
import { iconRegistry } from "@/lib/icons";
import { PhoneInput } from "@/components/shadcn/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/shadcn/file-upload";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Calendar } from "@/components/shadcn/calendar";
import { formatDate, formatPrice, formatTimeTo12Hour } from "@/lib/format";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/shadcn/skeleton";
import { MAX_FILES_UPLOAD, MAX_SIZE_UPLOAD } from "@/lib/zod";
import { getAvailableTimes } from "@/actions/consultation.action";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group";
import { Lightbox } from "@/components/shared/lightbox";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const BOOKING_TIMEZONE = "America/New_York";

export const RenderControl: React.FC<{
  isSubmitting: boolean;
  data: FormField;
  field: ControllerRenderProps<FieldValues, string>;
  form: UseFormReturn;
  consultationSlug: string;
  getAvailability?: typeof getAvailableTimes;
}> = ({
  isSubmitting,
  data,
  field,
  form,
  consultationSlug,
  getAvailability = getAvailableTimes,
}) => {
  const RenderInput =
    data.type === "textarea" ? InputGroupTextarea : InputGroupInput;
  const [lightbox, setLightbox] = React.useState<{
    images: string[];
    title: string;
    initialIndex: number;
  } | null>(null);

  switch (data.type) {
    case "text":
    case "email":
    case "textarea":
    case "number": {
      return (
        <FormControl>
          <InputWithAddons data={data}>
            <RenderInput
              {...field}
              value={field.value ?? ""}
              type={data.type}
              placeholder={data.placeholder ?? ""}
              disabled={isSubmitting}
            />
          </InputWithAddons>
        </FormControl>
      );
    }
    case "tel":
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="US"
            placeholder={data.placeholder}
            disabled={isSubmitting}
            {...field}
          />
        </FormControl>
      );
    case "date":
      return (
        <FormControl>
          <InputWithAddons data={data}>
            <DateField
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
              placeholder={data.placeholder}
            />
          </InputWithAddons>
        </FormControl>
      );
    case "datetime-local":
      return (
        <FormControl>
          <InputWithAddons data={data}>
            <DateTimeField
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
              placeholder={data.placeholder}
              consultationSlug={consultationSlug}
              getAvailability={getAvailability}
            />
          </InputWithAddons>
        </FormControl>
      );
    case "size": {
      return (
        <FormControl>
          <div className="flex flex-wrap gap-2">
            {data.sizes?.map((ds) => {
              const isSelected = field.value === ds;
              return (
                <Button
                  key={ds}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  type="button"
                  className={cn(
                    "font-mono text-xs! font-normal tracking-normal",
                  )}
                  onClick={() => field.onChange(ds)}
                >
                  {ds}
                </Button>
              );
            })}
          </div>
        </FormControl>
      );
    }
    case "select":
      return (
        <FormControl>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={data.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {data.options?.map((opt: FieldOption) => (
                <SelectItem key={opt.id} value={opt.id as string}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      );
    case "checkbox": {
      const selectedValues = form.watch(data?.name as string) ?? [];

      const containerVariants = {
        hidden: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.04,
          },
        },
        exit: {
          opacity: 0,
        },
      };

      const itemVariants = {
        hidden: {
          opacity: 0,
          x: -20,
        },
        animate: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.2,
            ease: "easeOut",
          },
        },
        exit: {
          opacity: 0,
          x: -10,
        },
      };

      return (
        <FormControl>
          <ul className="bg-secondary/40 flex w-full flex-col divide-y border shadow-xs">
            {data?.options?.map(({ id, label, description, interests }) => {
              const checked = selectedValues.includes(id);
              const showSubInterests = checked && interests?.length;

              return (
                <React.Fragment key={id}>
                  <Label
                    htmlFor={`dress-${id}`}
                    className={cn(
                      "bg-card text-muted-foreground flex cursor-pointer items-start justify-between gap-4 p-5 text-[10px] tracking-widest uppercase",
                      {
                        "pointer-events-none opacity-50": isSubmitting,
                      },
                    )}
                  >
                    <Checkbox
                      id={`dress-${id}`}
                      disabled={isSubmitting}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];

                        if (checked) {
                          field.onChange([...current, id]);
                          return;
                        }

                        // remove parent + all sub-interests
                        const subInterestIds =
                          interests?.map((i) => i.id) ?? [];

                        const next = current.filter(
                          (v: string) =>
                            v !== id && !subInterestIds.includes(v),
                        );

                        field.onChange(next);
                      }}
                    />

                    <div className="flex-1">
                      <p className="mb-1 text-[11px] font-medium">{label}</p>
                      {description && (
                        <p className="text-muted-foreground">{description}</p>
                      )}
                    </div>
                  </Label>

                  <AnimatePresence initial={false}>
                    {showSubInterests && (
                      <motion.div
                        key="sub-interests"
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <motion.ul
                          layout
                          variants={containerVariants as Variants}
                          initial="hidden"
                          animate="animate"
                          exit="exit"
                          className="grid w-full grid-cols-1 divide-y pl-5"
                        >
                          {interests!.map(({ id, label, description }) => (
                            <motion.li
                              key={id}
                              variants={itemVariants as Variants}
                              className="border-l"
                            >
                              <Label
                                htmlFor={`dress-${id}`}
                                className={cn(
                                  "bg-card text-muted-foreground flex cursor-pointer items-start justify-between gap-4 p-5 text-[10px] tracking-widest uppercase",
                                  {
                                    "pointer-events-none opacity-50":
                                      isSubmitting,
                                  },
                                )}
                              >
                                <Checkbox
                                  id={`dress-${id}`}
                                  disabled={isSubmitting || !checked}
                                  checked={field.value?.includes(id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...(field.value || []), id]
                                      : field.value?.filter(
                                          (v: string) => v !== id,
                                        );
                                    field.onChange(next);
                                  }}
                                />

                                <div className="flex-1">
                                  <p className="mb-1 text-[11px] font-medium">
                                    {label}
                                  </p>
                                  {description && (
                                    <p className="text-muted-foreground">
                                      {description}
                                    </p>
                                  )}
                                </div>
                              </Label>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </ul>
        </FormControl>
      );
    }
    case "radio": {
      return (
        <React.Fragment>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(value)}
              value={field.value}
              className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2"
              disabled={isSubmitting}
            >
              {data.items?.map((item) => {
                // Safely extract image URLs as string[]
                const imageUrls = Array.isArray(item.images)
                  ? (item.images as unknown as string[]).filter(
                      (img): img is string => typeof img === "string",
                    )
                  : [];

                return (
                  <FormLabel
                    key={item.id}
                    htmlFor={item.id}
                    className={cn(
                      "border-input has-data-[state=checked]:border-primary has-focus-visible:border-ring has-focus-visible:ring-ring relative flex w-full cursor-pointer flex-col gap-0! rounded-md border p-4 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-2",
                      {
                        "border-destructive": form.formState.errors.budgetType,
                        "pointer-events-none opacity-50": isSubmitting,
                      },
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <RadioGroupItem
                        value={item?.id as string}
                        id={item?.id}
                        disabled={isSubmitting}
                      />

                      <p className="text-[11px]!">
                        {`${formatPrice(item?.range?.from)}${item?.range?.to ? ` – ${formatPrice(item?.range.to)}` : "+"}`}
                      </p>
                    </div>

                    <div className="my-4 flex w-full flex-col gap-1">
                      <p className="text-foreground text-xs!">{item.title}</p>
                      <p className="text-xs! leading-normal font-medium tracking-normal normal-case">
                        {item.description}
                      </p>
                    </div>

                    {imageUrls.length > 0 ? (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightbox({
                            images: imageUrls,
                            title: item.title as string,
                            initialIndex: 0,
                          });
                        }}
                        className="w-full"
                      >
                        Preview Examples
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled
                        variant="outline"
                        className="w-full"
                      >
                        No available preview
                      </Button>
                    )}
                  </FormLabel>
                );
              })}
            </RadioGroup>
          </FormControl>

          <Lightbox
            open={!!lightbox}
            images={lightbox?.images ?? []}
            title={lightbox?.title}
            initialIndex={lightbox?.initialIndex ?? 0}
            onClose={() => setLightbox(null)}
          />
        </React.Fragment>
      );
    }
    case "file":
      return (
        <FormControl>
          <FileField
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
          />
        </FormControl>
      );
  }
};

const InputWithAddons = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: FormField;
}) => (
  <InputGroup>
    {children}
    <FieldAddon side="start" data={data} />
    <FieldAddon side="end" data={data} />
  </InputGroup>
);

const FieldAddon = React.memo(
  ({ side, data }: { side: "start" | "end"; data: FormField }) => {
    const config = data.icons?.[side];
    if (!config) return null;

    // Direct static lookup – no dynamic component creation
    const IconComponent =
      iconRegistry[config.icon as keyof typeof iconRegistry];

    return (
      <InputGroupAddon align={side === "end" ? "inline-end" : undefined}>
        {IconComponent && <IconComponent />}
        {config.value}
      </InputGroupAddon>
    );
  },
);
FieldAddon.displayName = "FieldAddon";

function DateField({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex-1">
        <InputGroupInput
          value={formatDate(value, "long", "")}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="cursor-pointer"
        />
      </PopoverTrigger>

      <PopoverContent className="w-auto overflow-hidden p-0" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          disabled={{ before: today }}
          onSelect={(date) => {
            if (!date) return;
            // Store in local YYYY-MM-DD
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function DateTimeField({
  value,
  onChange,
  disabled,
  placeholder,
  consultationSlug,
  getAvailability = getAvailableTimes,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  consultationSlug: string;
  getAvailability?: typeof getAvailableTimes;
}) {
  const [open, setOpen] = React.useState(false);
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [blocked, setBlocked] = React.useState(false);
  const [blockMessage, setBlockMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [timeError, setTimeError] = React.useState<string | null>(null);
  const userInteracted = React.useRef(false);

  const selectedDatePart = value
    ? formatInTimeZone(new Date(value), BOOKING_TIMEZONE, "yyyy-MM-dd")
    : undefined;
  const selectedDate = selectedDatePart
    ? new Date(`${selectedDatePart}T00:00:00`)
    : undefined;
  const selectedTime = value
    ? formatInTimeZone(new Date(value), BOOKING_TIMEZONE, "HH:mm")
    : "";

  // Show toasts only after user interaction
  React.useEffect(() => {
    if (!userInteracted.current) return;
    if (blocked && blockMessage) {
      toast.info("Date Selection Unavailable", {
        description: blockMessage,
      });
    }
    if (timeError && !blocked) {
      toast.error("Time Slot Not Available", {
        description: timeError,
        duration: Infinity,
        closeButton: true,
      });
    }
  }, [blocked, blockMessage, timeError]);

  // Fetch availability when date part changes
  React.useEffect(() => {
    const datePart = value
      ? formatInTimeZone(new Date(value), BOOKING_TIMEZONE, "yyyy-MM-dd")
      : undefined;
    if (!datePart || !consultationSlug) {
      setAvailableSlots([]);
      setBlocked(false);
      setBlockMessage(null);
      setTimeError(null);
      return;
    }

    // ✅ Guard against undefined or non‑function
    if (typeof getAvailability !== "function") {
      console.error("getAvailability is not a function", getAvailability);
      setAvailableSlots([]);
      setBlocked(true);
      setBlockMessage("Availability service is unavailable. Please try again.");
      setTimeError(null);
      return;
    }

    setLoading(true);
    setTimeError(null);

    getAvailability(consultationSlug, datePart)
      .then((result) => {
        setAvailableSlots(result.slots);
        setBlocked(result.blocked);
        setBlockMessage(result.message || "No slots available");
        // If blocked, clear the field value if it's set
        if (result.blocked && value) {
          onChange(undefined);
        }
        // Only set timeError if user has interacted
        if (
          userInteracted.current &&
          selectedTime &&
          !result.blocked &&
          !result.slots.includes(selectedTime)
        ) {
          setTimeError(result.message);
        } else {
          setTimeError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch availability:", err);
        setAvailableSlots([]);
        setBlocked(true);
        setBlockMessage("Unable to load availability. Please try again.");
        setTimeError(null);
        // Also clear the field on error
        if (value) onChange(undefined);
      })
      .finally(() => setLoading(false));
  }, [value, consultationSlug, onChange, getAvailability, selectedTime]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    userInteracted.current = true;

    // Use the selected date but keep the currently chosen time (if any)
    let time = selectedTime;
    if (!time && availableSlots.length > 0) {
      time = availableSlots[0];
    } else if (!time) {
      time = "10:00";
    }

    // Construct a Date object that represents the Eastern time
    const dateStr = format(date, "yyyy-MM-dd");
    const easternDate = fromZonedTime(
      `${dateStr}T${time}:00`,
      BOOKING_TIMEZONE,
    );

    // Store as UTC ISO string
    onChange(easternDate.toISOString());
    setOpen(false);
    setTimeError(null);
  };

  const handleTimeChange = (newTime: string) => {
    userInteracted.current = true;
    if (!selectedDate) return;
    if (!availableSlots.includes(newTime)) {
      setTimeError("This time slot is not available.");
      return;
    }
    setTimeError(null);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const easternDate = fromZonedTime(
      `${dateStr}T${newTime}:00`,
      BOOKING_TIMEZONE,
    );
    onChange(easternDate.toISOString());
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-1 gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full flex-1">
          <InputGroupInput
            value={!loading && selectedDate ? format(selectedDate, "PPP") : ""}
            placeholder={
              loading
                ? "Checking availability..."
                : placeholder || "Select date"
            }
            readOnly
            disabled={disabled || loading}
            onClick={() => setOpen(true)}
            className="placeholder:text-muted-foreground/80! cursor-pointer"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={{ before: today }}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      {!blocked && availableSlots.length > 0 ? (
        <Select
          value={selectedTime}
          onValueChange={handleTimeChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-max shadow-none">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {formatTimeTo12Hour(slot)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : loading ? (
        <Skeleton className="bg-secondary h-12! w-[100px]" />
      ) : null}
    </div>
  );
}

function FileField({
  value,
  onChange,
  disabled,
}: {
  value?: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const files = value || [];

  const onFileReject = React.useCallback((file: File, message: string) => {
    const truncatedName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
    toast.warning(message, {
      description: `"${truncatedName}" has been rejected`,
      duration: 8000,
    });
  }, []);

  return (
    <FileUpload
      value={files}
      onValueChange={onChange}
      accept="image/*"
      maxFiles={MAX_FILES_UPLOAD}
      maxSize={MAX_SIZE_UPLOAD}
      onFileReject={onFileReject}
      disabled={disabled}
      multiple
    >
      <FileUploadDropzone
        className={cn(
          files?.length >= MAX_FILES_UPLOAD || disabled
            ? "pointer-events-none cursor-not-allowed opacity-50"
            : "",
        )}
      >
        <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
          <ImagePlusIcon className="size-8" />

          <p className="mt-4 text-sm font-medium">Drag & drop files here.</p>
          <p className="text-xs">
            Or click to browse (max {MAX_FILES_UPLOAD} files, up to{" "}
            {MAX_SIZE_UPLOAD / (1024 * 1024)}
            MB each)
          </p>
        </div>
      </FileUploadDropzone>

      <FileUploadList className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {files?.map((file) => {
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
                {!disabled && (
                  <FileUploadItemDelete asChild disabled={disabled}>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      disabled={disabled}
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
  );
}
