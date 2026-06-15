import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="h-dvh py-24 lg:py-32">
        <Container className="flex h-full flex-col justify-center">
          <div className="flex grow flex-col items-center justify-center pt-16 text-center">
            <span className="mb-4 block text-xs font-medium tracking-widest uppercase">
              Error 404
            </span>
            <h1 className="mb-6 max-w-4xl font-serif text-5xl leading-[1.2] sm:text-6xl md:text-7xl md:leading-[0.98] lg:text-8xl">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-10 max-w-md text-sm text-balance">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/" className={buttonVariants({ size: "xl" })}>
              <span>Return to Home</span>
            </Link>
          </div>
        </Container>
      </div>
    </main>
  );
}
