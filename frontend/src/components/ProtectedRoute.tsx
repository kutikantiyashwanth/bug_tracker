'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthenticated, fetchCurrentUser, logout, connectSocket } = useStore();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const token = localStorage.getItem('token');

    // No token — go to login immediately
    if (!token) {
      router.replace('/login');
      return;
    }

    // Already have user data in persisted store — connect socket and show immediately
    if (isAuthenticated && currentUser) {
      connectSocket();
      return;
    }

    // Have token but no user in store — fetch silently
    fetchCurrentUser().then(() => {
      const state = useStore.getState();
      if (!state.isAuthenticated || !state.currentUser) {
        logout();
        router.replace('/login');
      }
    }).catch(() => {
      logout();
      router.replace('/login');
    });
  }, []);

  // Show children immediately if we have persisted auth state — no blank flash
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token && !isAuthenticated) return null;

  return <>{children}</>;
}
