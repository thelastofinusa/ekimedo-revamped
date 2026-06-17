"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Slot as SlotPrimitive, type Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { MAX_TEXTAREA_LENGTH, MIN_TEXTAREA_LENGTH } from "@/lib/validators";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-1", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  required = false,
  currentLength = undefined,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean;
  currentLength?: number;
}) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-[10px] tracking-widest uppercase",
        className,
        error && "text-destructive",
      )}
      htmlFor={formItemId}
      {...props}
    >
      <span>{props.children}</span>
      {required && <span className="text-destructive">*</span>}
      {currentLength !== undefined && (
        <span
          className={cn(
            "ml-auto text-[10px] font-medium tracking-widest uppercase",
            currentLength > MAX_TEXTAREA_LENGTH
              ? "text-destructive"
              : currentLength < MIN_TEXTAREA_LENGTH
                ? "text-muted-foreground"
                : "text-green-700",
          )}
        >
          {currentLength}/{MAX_TEXTAREA_LENGTH}
        </span>
      )}
    </Label>
  );
}

function FormControl({
  ...props
}: React.ComponentProps<typeof SlotPrimitive.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <SlotPrimitive.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn(
        "text-muted-foreground text-[10px] tracking-widest uppercase",
        className,
      )}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        "text-destructive text-[10px] tracking-widest uppercase",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
