import "server-only";

import { after } from "next/server";

export function queueEmailTask(task: () => Promise<unknown>) {
  // `after` runs the task after the response is sent.
  // If unavailable (e.g. unsupported runtime), fall back to async fire-and-forget.
  if (typeof after === "function") {
    after(async () => {
      try {
        await task();
      } catch (error) {
        console.error("Queued email task failed:", error);
      }
    });
  } else {
    console.warn(
      "next/server `after` is not available; running email task inline.",
    );
    task().catch((error) => {
      console.error("Inline email task failed:", error);
    });
  }
}
