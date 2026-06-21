import type { IconType } from "react-icons";

import * as FaIcons from "react-icons/fa6";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as FiIcons from "react-icons/fi";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as IoIcons from "react-icons/io5";
import * as MdIcons from "react-icons/md";

export const iconRegistry = {
  ...FaIcons,
  ...AiIcons,
  ...BsIcons,
  ...FiIcons,
  ...HiIcons,
  ...Hi2Icons,
  ...IoIcons,
  ...MdIcons,
} satisfies Record<string, IconType>;

export function resolveIcon(name?: string | null): IconType | null {
  if (!name) return null;
  return iconRegistry[name as keyof typeof iconRegistry] ?? null;
}
