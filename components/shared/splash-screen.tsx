import Image from "next/image";
import { siteConfig } from "@/config/site.config";

export const SplashScreen = () => {
  return (
    <div className="bg-foreground pointer-events-none fixed top-0 left-0 z-9999 flex h-screen w-screen items-center justify-center">
      <Image
        src="/assets/logo/vertical-bone.svg"
        alt={siteConfig.title}
        width={100}
        height={100}
        priority
        quality={100}
        className="pointer-events-none size-[76px] animate-pulse object-contain select-none md:size-[100px]"
      />
    </div>
  );
};
