import { IconType } from "react-icons";
import { AiOutlineDeliveredProcedure } from "react-icons/ai";
import { BsCreditCard } from "react-icons/bs";
import { FiLoader } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { TbCancel } from "react-icons/tb";

export type OrderStatusValue =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusConfig {
  /** The status value/key */
  value: OrderStatusValue;
  /** Display label */
  label: string;
  /** Badge color classes (combined bg + text) */
  className: string;
  /** Hugeicons proxy component */
  icon: IconType;
  /** Emoji for AI/chat display */
  emoji: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatusValue, OrderStatusConfig> =
  {
    pending: {
      value: "pending",
      label: "Pending",
      className: "bg-blue-100 text-blue-800",
      icon: FiLoader,
      emoji: "⏳",
    },
    paid: {
      value: "paid",
      label: "Paid",
      className: "bg-green-100 text-green-800",
      icon: BsCreditCard,
      emoji: "✅",
    },
    shipped: {
      value: "shipped",
      label: "Shipped",
      className: "bg-orange-100 text-orange-800",
      icon: MdOutlineLocalShipping,
      emoji: "📦",
    },
    delivered: {
      value: "delivered",
      label: "Delivered",
      className: "bg-foreground text-background",
      icon: AiOutlineDeliveredProcedure,
      emoji: "🎉",
    },
    cancelled: {
      value: "cancelled",
      label: "Cancelled",
      className: "bg-red-100 text-red-800",
      icon: TbCancel,
      emoji: "❌",
    },
  };

/** All valid order status values */
export const ORDER_STATUS_VALUES = Object.keys(
  ORDER_STATUS_CONFIG,
) as OrderStatusValue[];

/** Tabs for admin order filtering (includes "all" option) */
export const ORDER_STATUS_TABS = [
  { value: "all", label: "All" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value].label,
  })),
] as const;

/** Format for Sanity schema options.list */
export const ORDER_STATUS_SANITY_LIST = ORDER_STATUS_VALUES.map((value) => ({
  title: ORDER_STATUS_CONFIG[value].label,
  value,
}));

/** Get order status config with fallback to "paid" */
export const getOrderStatus = (
  status: string | null | undefined,
): OrderStatusConfig =>
  ORDER_STATUS_CONFIG[status as OrderStatusValue] ?? ORDER_STATUS_CONFIG.paid;

/** Get emoji display for status (for AI/chat) */
export const getOrderStatusEmoji = (
  status: string | null | undefined,
): string => {
  const config = getOrderStatus(status);
  return `${config.emoji} ${config.label}`;
};

export const SIZE_FILTERS = [
  { name: "0-2 (XS)", value: "0-2 (XS)" },
  { name: "4-6 (S)", value: "4-6 (S)" },
  { name: "8-10 (M)", value: "8-10 (M)" },
  { name: "12-14 (L)", value: "12-14 (L)" },
  { name: "16-18 (XL)", value: "16-18 (XL)" },
];

export const SIZE_CHART = [
  {
    name: "Extra Small",
    size: "XS",
    numeric: "0—2",
    bust: "32—33 / 81—84",
    waist: "24—25 / 61—64",
    hip: "34—35 / 86—89",
  },
  {
    name: "Small",
    size: "S",
    numeric: "4—6",
    bust: "34—35 / 86—89",
    waist: "26—27 / 66—69",
    hip: "36—37 / 91—94",
  },
  {
    name: "Medium",
    size: "M",
    numeric: "8—10",
    bust: "36—37 / 91—94",
    waist: "28—29 / 71—74",
    hip: "38—39 / 96—99",
  },
  {
    name: "Large",
    size: "L",
    numeric: "12—14",
    bust: "38.5—40 / 98—101",
    waist: "30.5—32 / 77—81",
    hip: "40.5—42 / 103—107",
  },
  {
    name: "Extra Large",
    size: "XL",
    numeric: "16—18",
    bust: "41.5—43 / 105—109",
    waist: "33.5—35 / 85—89",
    hip: "44.5—46 / 113—117",
  },
];
