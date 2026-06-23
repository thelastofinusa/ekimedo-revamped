"use client";
import Link from "next/link";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { ContactIcon, MailIcon, XIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, buttonVariants } from "@/components/shadcn/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { resolveIcon } from "@/lib/icons";
import {
  QUERY_CATEGORIES_RESULT,
  QUERY_SOCIAL_HANDLES_RESULT,
} from "@/sanity.types";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { Textarea } from "@/components/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/shadcn/input-group";
import { Input } from "@/components/shadcn/input";
import { PhoneInput } from "@/components/shadcn/phone-input";
import { toast } from "sonner";
import { submitContactForm } from "@/actions/contact.action";

export const SubmitForm: React.FC<{
  categories: QUERY_CATEGORIES_RESULT;
  socialHandles: QUERY_SOCIAL_HANDLES_RESULT;
}> = ({ categories, socialHandles }) => {
  const [isSubmitting, startTransition] = React.useTransition();

  const form = useForm<ZSchemaType["contact"]>({
    resolver: zodResolver(zSchema.contact),
    defaultValues: {
      fName: "",
      lName: "",
      email: "",
      inquiryType: "",
      phone: "",
      message: "",
    },
  });

  const inquiryType = useWatch({
    control: form.control,
    name: "inquiryType",
  });

  const isCustomSelected = inquiryType === "custom";

  async function onSubmit(values: ZSchemaType["contact"]) {
    const refined = {
      ...values,
      inquiryType:
        values.inquiryType === "custom"
          ? (values.customField as string)
          : (categories.find((cat) => cat.slug === values.inquiryType)?.name ??
            values.inquiryType),
    };
    toast.loading("Submitting message. Please wait..", {
      id: "submitting-message",
    });

    startTransition(async () => {
      // Directly call the server action
      const result = await submitContactForm(refined);
      toast.dismiss("submitting-message");

      if (result.success) {
        toast.success("Submission success!", {
          description: result.message,
        });
        form.reset();
      } else {
        toast.error("Submission failed!", {
          description: result.message,
          duration: Infinity,
          closeButton: true,
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-10 py-24 lg:py-32">
      <Container size="sm" className="md:py-8 lg:py-16">
        <div className="flex w-full flex-col-reverse overflow-hidden border shadow-xs md:flex-row">
          <div className="bg-foreground flex w-full flex-col gap-6 p-6 md:w-5/12 md:p-8 xl:p-12">
            <div className="flex flex-col">
              <h2 className="text-background mb-1 font-serif text-xl md:text-2xl">
                Get in touch
              </h2>
              <p className="text-muted-foreground mb-8 text-sm font-normal">
                We&apos;re here to help with any questions or feedback.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <MailIcon className="text-background size-6" />
                  <Link
                    href={`mailto:${siteConfig.supportEmail}`}
                    target="_blank"
                    className="group flex flex-col gap-0.5"
                  >
                    <p className="text-background text-xs font-medium uppercase">
                      Support Email
                    </p>
                    <p className="text-muted-foreground group-hover:text-background text-sm group-hover:underline">
                      {siteConfig.supportEmail}
                    </p>
                  </Link>
                </div>
                <div className="flex items-start gap-3">
                  <ContactIcon className="text-background size-6" />
                  <Link
                    href="tel:+12029074865"
                    target="_blank"
                    className="group flex flex-col gap-0.5"
                  >
                    <p className="text-background text-xs font-medium uppercase">
                      Phone Number
                    </p>
                    <p className="text-muted-foreground group-hover:text-background text-sm group-hover:underline">
                      (+1) 202-907-4865
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                {socialHandles &&
                  socialHandles.map((social) => {
                    const Icon = resolveIcon(social.icon);

                    return (
                      <Tooltip key={social._id}>
                        <TooltipTrigger>
                          <a
                            href={social.url || "#"}
                            target={social.url ? "_blank" : "_self"}
                            title={social.name || "Follow us"}
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-xs",
                              className: "group",
                            })}
                          >
                            {Icon && (
                              <Icon className="text-background group-hover:text-foreground!" />
                            )}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent theme="light" align="start" side="top">
                          <p>{social.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
              <div className="map-container h-48 overflow-hidden border md:h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12424.290919500167!2d-76.9167386!3d38.8765778!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7bf25fe8ebc8d%3A0x8fb5f2e243a74c7e!2sCapitol%20Heights%2C%20MD%2020743%2C%20USA!5e0!3m2!1sen!2sng!4v1771208827328!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-card flex-1 space-y-5 overflow-hidden p-6 md:p-8 xl:p-12"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
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
                  name="lName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          type="email"
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
                          defaultCountry="US"
                          placeholder="+1 (555) 000-0000"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCustomSelected && (
                <FormField
                  control={form.control}
                  name="customField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>What is this about?</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            disabled={isSubmitting}
                            placeholder="Please specify"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              size="icon-sm"
                              type="button"
                              onClick={() => form.setValue("inquiryType", "")}
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
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>What is this about?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={Boolean(
                              form.formState.errors.inquiryType,
                            )}
                            disabled={
                              form.formState.isSubmitting || isSubmitting
                            }
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              {categories.length > 0 &&
                                categories.map((type) => (
                                  <SelectItem key={type._id} value={type.slug!}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              <SelectItem value="custom">Others</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => {
                  const currentLength = field.value?.length ?? 0;

                  return (
                    <FormItem>
                      <FormLabel required currentLength={currentLength}>
                        Write your message
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us how we can help you.."
                          disabled={form.formState.isSubmitting || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <Button
                size="xl"
                type="submit"
                className="w-full"
                loadingText="Sending Message..."
                isLoading={form.formState.isSubmitting || isSubmitting}
              >
                <span>Send Message</span>
              </Button>
            </form>
          </Form>
        </div>
      </Container>
    </div>
  );
};
