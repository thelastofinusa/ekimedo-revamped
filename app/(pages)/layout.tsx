import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export default function PagesLayout(props: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <NextTopLoader showSpinner={false} color="var(--primary)" />
      <Header />
      <main>{props.children}</main>
      <Footer />
      {process.env.NODE_ENV === "production" && <Analytics />}
      <Toaster richColors theme="dark" duration={5000} />
    </TooltipProvider>
  );
}
