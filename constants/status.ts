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
