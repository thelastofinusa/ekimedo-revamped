import { cn } from "@/lib/utils";
import localFont from "next/font/local";

const fontSans = localFont({
  variable: "--font-sans",
  src: "./fonts/NotoSans/NotoSans-VariableFont_wdth,wght.ttf",
  weight: "100 700",
  style: "normal",
});

const fontSerif = localFont({
  variable: "--font-serif",
  src: "./fonts/PlayfairDisplay/PlayfairDisplay-VariableFont_wght.ttf",
  style: "normal",
});

const fontMono = localFont({
  variable: "--font-mono",
  src: "./fonts/NotoSansMono/NotoSansMono-VariableFont_wdth,wght.ttf",
  style: "normal",
});

export const fontVariables = (className?: string) =>
  cn(fontSans.variable, fontSerif.variable, fontMono.variable, className);
