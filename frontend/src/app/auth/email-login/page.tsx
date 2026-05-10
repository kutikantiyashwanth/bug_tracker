"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store-api";
import { Bug } from "lucide-react";

// This page handles magic link auto-login from email links.
// URL format: /auth/email-login?jwt=<token>&redirect=/dashboard/bugs
export default function EmailLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCurrentUser, logout } = useStore();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const jwt = searchParams.get("jwt");
    const redirect = searchParams.get("redirect") || "/dashboard/bugs";

    if (!jwt) {
      setError("Invalid login link — no token found.");
      setStatus("error");
      return;
    }

    // Log out any existing session first
    logout();

    // Store the new JWT
    localStorage.setItem("token", jwt);

    // Fetch the user profile to populate the store
    fetchCurrentUser()
      .then(() => {
        const state = useStore.getState();
        if (state.isAuthenticated && state.currentUser) {
          // Redirect to the intended page
          router.replace(redirect);
        } else {
          setError("Login failed. Please log in manually.");
          setStatus("error");
        }
      })
      .catch(() => {
        setError("Login failed. The link may have expired. Please log in manually.");
        setStatus("error");
      });
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
            <Bug className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Login Link Expired</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
          <Bug className="h-8 w-8 text-indigo-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Logging you in...</h2>
        <p className="text-sm text-slate-500">Please wait while we set up your session.</p>
        <div className="h-1 w-48 bg-slate-100 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
