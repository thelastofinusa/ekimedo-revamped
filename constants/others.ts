import { IconType } from "react-icons";
import { PiStripeLogo } from "react-icons/pi";
import { TbBrandPaypalFilled } from "react-icons/tb";

export const EVENT_TYPES = [
  { title: "Wedding", value: "wedding" },
  { title: "Prom", value: "prom" },
  { title: "Reception", value: "reception" },
  { title: "Special Occasion", value: "special-occasion" },
];

export const EVENT_TYPES_KEYS: Record<string, string> = {
  wedding: "Wedding",
  prom: "Prom",
  reception: "Reception",
  "special-occasion": "Special Occasion",
};

export type PAYMENT_METHODS_TYPE = {
  id: "card" | "paypal";
  label: string;
  icon: IconType;
  description: string;
  isAvailable: boolean;
};
export const PAYMENT_METHODS: PAYMENT_METHODS_TYPE[] = [
  {
    id: "card",
    label: "Stripe",
    icon: PiStripeLogo,
    description: "Fast, secure card payment.",
    isAvailable: true,
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: TbBrandPaypalFilled,
    description: "Quick checkout with PayPal.",
    isAvailable: true,
  },
];
