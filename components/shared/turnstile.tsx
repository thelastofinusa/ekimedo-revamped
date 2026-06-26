"use client";

import * as React from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      reset: (id?: string) => void;
    };
    [key: `turnstile_${string}`]: ((token: string) => void) | undefined;
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
  const id = React.useId().replace(/:/g, "");
  const callbackName = `turnstile_${id}` as const;
  const expireName = `turnstile_${id}_expired` as const;

  React.useEffect(() => {
    window[callbackName] = onVerify;
    window[expireName] = () => onExpire?.();

    return () => {
      delete window[callbackName];
      delete window[expireName];
    };
  }, [callbackName, expireName, onExpire, onVerify]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-action={action}
        data-callback={callbackName}
        data-expired-callback={expireName}
        data-error-callback={expireName}
      />
    </div>
  );
}
