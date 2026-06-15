import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

type LogoVariant = "horizontal" | "wordmark" | "vertical";
type LogoColor = "charcoal" | "bone";

const getLogoSrc = (variant: LogoVariant | undefined, color: LogoColor) =>
  variant
    ? `/assets/logo/${variant}-${color}.svg`
    : `/assets/logo/${color}.svg`;

export const Logo: React.FC<{
  className?: string;
  href?: string;
  srcDesktop?: LogoVariant;
  srcMobile?: LogoVariant;
  color?: LogoColor;
  desktopSize?: [number, number];
  mobileSize?: [number, number];
}> = ({
  color = "charcoal",
  desktopSize = [120, 42],
  mobileSize = [40, 40],
  ...props
}) => {
  const Wrapper = props.href ? Link : "div";

  return (
    <Wrapper
      href={{ pathname: props.href ?? "/" }}
      className={cn("inline-flex items-center", props.className)}
    >
      <Image
        src={getLogoSrc(props.srcDesktop, color)}
        alt={siteConfig.title}
        width={desktopSize[0]}
        height={desktopSize[1]}
        className="hidden h-auto md:block"
        priority
        quality={100}
      />

      <Image
        src={getLogoSrc(props.srcMobile, color)}
        alt={siteConfig.title}
        width={mobileSize[0]}
        height={mobileSize[1]}
        className="block h-auto md:hidden"
        priority
        quality={100}
      />
    </Wrapper>
  );
};
