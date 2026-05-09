"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store-api";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const logout = useStore((s) => s.logout);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if a real token exists in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      // No token — clear any stale persisted auth state and go to login
      logout();
      router.replace("/login");
    } else if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
    setChecked(true);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading workspace...</p>
      </div>
    </div>
  );
}
