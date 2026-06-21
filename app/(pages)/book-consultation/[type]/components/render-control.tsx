"use client";
import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { FieldOption, FormField } from "@/sanity.types";
import { FormControl } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { iconRegistry } from "@/lib/icons-registry";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate, formatTimeTo12Hour } from "@/lib/format";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { toast } from "sonner";
import { getAvailableTimes } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";

export const RenderControl: React.FC<{
  isSubmitting: boolean;
  data: FormField;
  field: ControllerRenderProps<FieldValues, string>;
  form: UseFormReturn;
  consultationSlug: string;
}> = ({ isSubmitting, data, field, form, consultationSlug }) => {
  const RenderInput =
    data.type === "textarea" ? InputGroupTextarea : InputGroupInput;

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
              min={data.type === "number" ? (data.min ?? 1) : undefined}
              max={data.type === "number" ? data.max : undefined}
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
            />
          </InputWithAddons>
        </FormControl>
      );
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
    case "file":
      return (
        <FormControl>
          <FileField
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            placeholder={data.placeholder}
            max={data.max}
            size={data.size}
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
}: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  consultationSlug: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [blocked, setBlocked] = React.useState(false);
  const [blockMessage, setBlockMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [timeError, setTimeError] = React.useState<string | null>(null);
  const userInteracted = React.useRef(false);

  const selectedDate = value ? new Date(value) : undefined;
  const selectedTime = value ? format(selectedDate!, "HH:mm") : "";

  // Show toasts only after user interaction
  React.useEffect(() => {
    if (!userInteracted.current) return;
    if (blocked && blockMessage) {
      toast.info("Day Blocked", {
        description: blockMessage,
      });
    }
    if (timeError && !blocked) {
      toast.error("Time Slot Unavailable", {
        description: timeError,
      });
    }
  }, [blocked, blockMessage, timeError]);

  // Fetch availability when date part changes
  React.useEffect(() => {
    const datePart = value ? value.split("T")[0] : undefined;
    if (!datePart || !consultationSlug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableSlots([]);
      setBlocked(false);
      setBlockMessage(null);
      setTimeError(null);
      return;
    }

    setLoading(true);
    setTimeError(null);
    getAvailableTimes(consultationSlug, datePart)
      .then((result) => {
        setAvailableSlots(result.slots);
        setBlocked(result.blocked);
        setBlockMessage(result.message || "No slots available");
        // Only set timeError if user has interacted
        if (
          userInteracted.current &&
          selectedTime &&
          !result.blocked &&
          !result.slots.includes(selectedTime)
        ) {
          setTimeError("This time slot is not available.");
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
      })
      .finally(() => setLoading(false));
  }, [value, consultationSlug]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    userInteracted.current = true;
    let time = selectedTime;
    if (!time && availableSlots.length > 0) {
      time = availableSlots[0];
    } else if (!time) {
      time = "10:00"; // fallback default
    }
    const combined = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(format(combined, "yyyy-MM-dd'T'HH:mm"));
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
    const combined = new Date(selectedDate);
    const [hours, minutes] = newTime.split(":").map(Number);
    combined.setHours(hours, minutes, 0, 0);
    onChange(format(combined, "yyyy-MM-dd'T'HH:mm"));
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
  placeholder,
  max,
  size,
}: {
  value?: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  max?: number | null;
  size?: number | null;
}) {
  const files = value || [];

  // Convert size to bytes for validation
  const maxSizeBytes = size && size > 0 ? size * 1024 * 1024 : undefined;

  const handleValidate = (file: File): string | null => {
    if (max && files.length >= max) {
      return `You can only upload up to ${max} files`;
    }
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      return `File size must be less than ${size}MB`;
    }
    return null;
  };

  return (
    <FileUpload
      value={files}
      onValueChange={onChange}
      accept="image/*"
      maxFiles={max ?? undefined}
      maxSize={maxSizeBytes}
      onFileValidate={handleValidate}
      onFileReject={(file: File, message: string) => {
        toast.error(message, {
          description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        });
      }}
      disabled={disabled}
      multiple
    >
      <FileUploadDropzone
        className={cn(
          (max && files.length >= max) || disabled
            ? "pointer-events-none cursor-not-allowed opacity-50"
            : "",
        )}
      >
        <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
          <ImagePlusIcon className="size-8" />
          <p className="mt-4 text-sm font-medium">
            {placeholder || "Drag & drop files here"}
          </p>
          <p className="text-xs">
            Or click to browse
            {max && ` (max ${max} files`}
            {size && `, up to ${size}MB each`}
            {max && ")"}
          </p>
        </div>
      </FileUploadDropzone>

      {files.length > 0 && (
        <FileUploadList
          orientation="vertical"
          className="grid grid-cols-3 gap-2 md:grid-cols-5"
        >
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="group p-0">
              <FileUploadItemPreview
                className={cn(
                  "aspect-square size-full! overflow-hidden",
                  disabled && "pointer-events-none opacity-60",
                )}
              />
              <FileUploadItemMetadata className="sr-only" />
              {!disabled && (
                <FileUploadItemDelete asChild>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="destructive"
                    disabled={disabled}
                    className="absolute top-1 right-1 opacity-0 transition-opacity md:group-hover:opacity-100"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </FileUploadItemDelete>
              )}
            </FileUploadItem>
          ))}
        </FileUploadList>
      )}
    </FileUpload>
  );
}
