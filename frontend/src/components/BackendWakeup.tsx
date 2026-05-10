"use client";

import { useEffect } from "react";

// Pings the backend health endpoint as soon as the page loads.
// This wakes up the Render free-tier backend before the user tries to log in,
// eliminating the 30-60 second cold start delay.
export function BackendWakeup() {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const healthUrl = apiUrl.replace("/api/v1", "") + "/api/v1/health";

    // Fire-and-forget — don't block anything, don't show errors
    fetch(healthUrl, { method: "GET", cache: "no-store" }).catch(() => {});
  }, []);

  return null; // renders nothing
}
