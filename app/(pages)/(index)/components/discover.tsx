import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/config/site.config";
import { buttonVariants } from "@/components/shadcn/button";
import { Container } from "@/components/shared/container";

export const DiscoverComp = () => {
  return (
    <div className="bg-background">
      <div className="py-24 lg:py-32">
        <Container>
          <div className="grid grid-cols-1 items-center gap-20 md:grid-cols-2">
            <div className="flex flex-col gap-6 md:gap-8">
              <header className="flex flex-col gap-2">
                <h2 className="leading-[1.1]">
                  Dedicated to Creativity, Culture & Growth
                </h2>
              </header>

              <div className="flex flex-col gap-6 sm:max-w-lg md:gap-8">
                <p className="text-lg leading-relaxed font-light">
                  At {siteConfig.title}, we believe every dress should tell a
                  story. Since the beginning, we&apos;ve been creating
                  beautiful, handcrafted gowns that make our clients feel
                  confident, special, and truly seen.
                </p>
                <p className="text-sm leading-relaxed opacity-40">
                  From bridal gowns to custom occasion wear, every piece is
                  designed with care, attention to detail, and a passion for
                  bringing your vision to life.
                </p>

                <Link
                  href="/about-us"
                  className={buttonVariants({
                    size: "lg",
                    variant: "default",
                    className: "w-max",
                  })}
                >
                  Discover Our Story
                </Link>
              </div>
            </div>

            <div className="bg-muted relative aspect-4/5 overflow-hidden shadow-xs">
              <Image
                src="/home/dedication.jpeg"
                alt="Dedication"
                fill
                priority
                quality={100}
                className="size-full scale-105 object-cover"
              />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};
