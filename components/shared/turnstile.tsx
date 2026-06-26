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

  // Store callbacks in refs so they never cause re-renders
  const onVerifyRef = React.useRef(onVerify);
  const onExpireRef = React.useRef(onExpire);
  React.useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  }, [onVerify, onExpire]);

  const renderWidget = React.useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // already removed
      }
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      // Use refs so these never cause widget re-render
      callback: (token: string) => onVerifyRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onExpireRef.current?.(),
    });
  }, [siteKey, action]); // ← onVerify/onExpire removed from deps

  React.useEffect(() => {
    if (scriptReady) renderWidget();
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, renderWidget]);

  React.useEffect(() => {
    if (window.turnstile) setScriptReady(true);
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
