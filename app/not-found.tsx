import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/shadcn/button";
import { TbDeviceDesktopQuestion } from "react-icons/tb";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-background relative flex min-h-dvh flex-col overflow-hidden">
      {/* Background Decor: Giant faint 404 watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.04]">
        <span className="font-serif text-[25rem] leading-none font-bold select-none md:text-[35rem]">
          404
        </span>
      </div>

      {/* Background Decor: Subtle glowing ambient orbs */}
      <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px]" />
      <div className="bg-primary/10 pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-[100px]" />

      <div className="relative z-10 flex h-dvh flex-col py-24 lg:py-32">
        <Container className="flex h-full flex-col justify-center">
          <div className="flex grow flex-col items-center justify-center pt-16 text-center">
            {/* Visual Anchor */}
            <div className="bg-primary/10 text-primary mb-6 flex h-16 w-16 items-center justify-center">
              <TbDeviceDesktopQuestion className="size-8" />
            </div>

            <span className="text-primary mb-4 block text-sm font-semibold tracking-widest uppercase">
              Error 404
            </span>

            <h1 className="mb-6 max-w-4xl font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Page not found
            </h1>

            <p className="text-muted-foreground mb-10 max-w-lg text-base text-balance md:text-lg">
              Oops! It seems the page you are looking for has vanished into the
              digital void, or perhaps it never existed at all.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/" className={buttonVariants({ size: "xl" })}>
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
