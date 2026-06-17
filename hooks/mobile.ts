"use client";
import * as React from "react";

interface PropsReturn {
  isMobile: boolean;
  isLoading: boolean;
}

export function useIsMobile(breakpoint = 768): PropsReturn {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkIsMobile = () => {
      // Check using media query
      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

      // Check using user agent (additional detection)
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
      ];

      const isMobileUA = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword)
      );

      // Combine both checks - prioritize media query but consider user agent
      const isMobileDevice =
        mediaQuery.matches || (isMobileUA && window.innerWidth <= 768);

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleChange = () => checkIsMobile();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Listen for window resize
    window.addEventListener("resize", checkIsMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return {
    isMobile,
    isLoading,
  };
}
