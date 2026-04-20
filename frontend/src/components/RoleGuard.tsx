"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { normalizeRole } from "@/lib/rbac";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { currentUser } = useStore();
  const role = normalizeRole(currentUser?.role || "developer");

  if (!allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mb-4">
          <ShieldX className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Access Restricted</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          This page is only available to{" "}
          <span className="font-medium text-gray-700">{allowedRoles.join(" / ")}</span> roles.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Your role: <span className="capitalize font-medium text-gray-600">{role}</span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
