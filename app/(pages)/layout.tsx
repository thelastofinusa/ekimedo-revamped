import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";

import { SanityLive } from "@/sanity/lib/live";
import { Header } from "@/components/shared/header";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import { CartProvider } from "@/components/providers/cart.provider";
import { Toaster } from "@/components/shadcn/sonner";
import { FooterWrapper } from "@/components/wrappers/footer.wrapper";

export default function PagesLayout(props: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <CartProvider>
        <Header />
        {props.children}
        <FooterWrapper />
        <Toaster
          richColors
          theme="dark"
          position="bottom-center"
          duration={5000}
        />
      </CartProvider>
      <NextTopLoader showSpinner={false} color="var(--primary)" />
      {process.env.NODE_ENV === "production" && <Analytics />}
      <SanityLive />
    </TooltipProvider>
  );
}
