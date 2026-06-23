import type { IconType } from "react-icons";

import * as FaIcons from "react-icons/fa6";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as FiIcons from "react-icons/fi";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as IoIcons from "react-icons/io5";
import * as MdIcons from "react-icons/md";
import * as TbIcons from "react-icons/tb";

export const iconRegistry = {
  ...FaIcons,
  ...AiIcons,
  ...BsIcons,
  ...FiIcons,
  ...HiIcons,
  ...Hi2Icons,
  ...IoIcons,
  ...MdIcons,
  ...TbIcons,
} satisfies Record<string, IconType>;

export function resolveIcon(name?: string | null): IconType | null {
  if (!name) return null;
  return iconRegistry[name as keyof typeof iconRegistry] ?? null;
}

/**
 * Convert a React‑Icon component name to a CDN slug.
 * Example: "BsFacebook" → "facebook", "FaInstagram" → "instagram"
 */
export function iconNameToSlug(iconName: string): string {
  // List of known prefixes used by react-icons
  const prefixes = ["Fa", "Bs", "Io", "Md", "Tb", "Fi", "Hi", "Hi2", "Ai"];
  let slug = iconName.toLowerCase();
  for (const prefix of prefixes) {
    if (iconName.startsWith(prefix)) {
      slug = iconName.slice(prefix.length);
      break;
    }
  }
  return slug.toLowerCase();
}

export function getSocialIconUrl(
  iconName: string | null | undefined,
): string | null {
  if (!iconName) return null;
  const slug = iconNameToSlug(iconName);
  return `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${slug}/mono.svg`;
}
