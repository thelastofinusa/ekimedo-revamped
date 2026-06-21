import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SanityLive } from "@/sanity/lib/live";
import { CartProvider } from "@/components/providers/cart.provider";

export default function PagesLayout(props: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <CartProvider>
        <NextTopLoader showSpinner={false} color="var(--primary)" />
        <Header />
        <main>{props.children}</main>
        <Footer />
        <Toaster
          richColors
          theme="dark"
          position="bottom-center"
          duration={5000}
        />
      </CartProvider>
      {process.env.NODE_ENV === "production" && <Analytics />}
      <SanityLive />
    </TooltipProvider>
  );
}
