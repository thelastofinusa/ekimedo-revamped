/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string) => void;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileProps = {
  action: string;
  disabled?: boolean;
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

export function Turnstile({
  action,
  disabled,
  onVerify,
  onExpire,
}: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [scriptReady, setScriptReady] = React.useState(false);

  const renderWidget = React.useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    // Remove existing widget if present (handles re-renders and page transitions)
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // widget may have already been removed
      }
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      callback: onVerify,
      "expired-callback": () => onExpire?.(),
      "error-callback": () => onExpire?.(),
    });
  }, [siteKey, action, onVerify, onExpire]);

  // Render when script becomes ready
  React.useEffect(() => {
    if (scriptReady) {
      renderWidget();
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, renderWidget]);

  // If script was already loaded (e.g. navigated back to this page),
  // render immediately without waiting for onReady
  React.useEffect(() => {
    if (window.turnstile) {
      setScriptReady(true);
    }
  }, []);

  if (!siteKey) return null;

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
