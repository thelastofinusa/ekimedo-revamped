"use client";
import React from "react";
import { render } from "@react-email/components";

export const EmailCard: React.FC<{
  name: string;
  component: React.ReactElement;
}> = ({ name, component }) => {
  const [html, setHtml] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function renderEmail() {
      try {
        const rendered = await render(component);
        if (mounted) setHtml(rendered);
      } catch (error) {
        console.error(error);

        if (mounted) {
          setHtml(`
      <pre style="white-space:pre-wrap">
        ${error instanceof Error ? error.stack : String(error)}
      </pre>
    `);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    renderEmail();
    return () => {
      mounted = false;
    };
  }, [component]);

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b bg-neutral-100 px-4 py-2">
        <span className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {name}
        </span>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="relative bg-neutral-200 p-3">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-200/60 backdrop-blur-sm">
            <div className="border-charcoal h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}

        <iframe
          srcDoc={html}
          title={name}
          className="h-[700px] w-full rounded bg-white"
        />
      </div>
    </div>
  );
};
