import { pixelBasedPreset } from "react-email";
import type { Config } from "tailwindcss";

export const tailwindConfig: Config = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        foreground: "#141414",
        card: {
          DEFAULT: "oklch(0.9967 0.0013 106.423)",
          foreground: "oklch(0.3211 0 0)",
        },
        popover: {
          DEFAULT: "oklch(0.9967 0.0013 106.423)",
          foreground: "oklch(0.3211 0 0)",
        },
        primary: {
          DEFAULT: "oklch(61.53% 0.13376 68.517)",
          foreground: "oklch(98.7% 0.022 95.277)",
        },
        secondary: {
          DEFAULT: "oklch(0.9181 0.0098 72.6567)",
          foreground: "oklch(19.125% 0.00002 271.152)",
        },
        muted: {
          DEFAULT: "oklch(0.9181 0.0098 72.6567)",
          foreground: "oklch(56.671% 0.00121 14.256)",
        },
        accent: {
          DEFAULT: "oklch(0.9181 0.0098 72.6567)",
          foreground: "oklch(19.125% 0.00002 271.152)",
        },
        destructive: {
          DEFAULT: "oklch(0.5594 0.19 25.8625)",
          foreground: "oklch(1 0 0)",
        },
        border: "rgb(208, 208, 208)",
        input: "oklch(0.9067 0 0)",
        ring: "oklch(0.4891 0 0)",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.325rem",
        md: "0.325rem",
        lg: "0.325rem",
        xl: "0.575rem",
        "2xl": "0.825rem",
      },
      boxShadow: {
        "2xs": "2px 2px 0px 0px hsl(0 0% 64.7059% / 0.28)",
        xs: "2px 2px 0px 0px hsl(0 0% 64.7059% / 0.28)",
        sm: `
          2px 2px 0px 0px hsl(0 0% 64.7059% / 0.57),
          2px 1px 2px -1px hsl(0 0% 64.7059% / 0.57)
        `,
        DEFAULT: `
          2px 2px 0px 0px hsl(0 0% 64.7059% / 0.57),
          2px 1px 2px -1px hsl(0 0% 64.7059% / 0.57)
        `,
        md: `
          2px 2px 0px 0px hsl(0 0% 64.7059% / 0.57),
          2px 2px 4px -1px hsl(0 0% 64.7059% / 0.57)
        `,
        lg: `
          2px 2px 0px 0px hsl(0 0% 64.7059% / 0.57),
          2px 4px 6px -1px hsl(0 0% 64.7059% / 0.57)
        `,
        xl: `
          2px 2px 0px 0px hsl(0 0% 64.7059% / 0.57),
          2px 8px 10px -1px hsl(0 0% 64.7059% / 0.57)
        `,
        "2xl": "2px 2px 0px 0px hsl(0 0% 10.7059% / 0.1)",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      fontFamily: {
        sans: ["Noto Sans", "Arial", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["Noto Sans Mono", "monospace"],
      },
    },
  },
};
