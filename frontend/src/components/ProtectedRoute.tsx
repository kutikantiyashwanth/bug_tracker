'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthenticated, fetchCurrentUser, logout, connectSocket } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // No token — go to login
    if (!token) {
      router.replace('/login');
      return;
    }

    // Already have user data — show immediately, connect socket
    if (isAuthenticated && currentUser) {
      setReady(true);
      connectSocket();
      return;
    }

    // Have token but no user — fetch silently in background
    fetchCurrentUser().then(() => {
      const state = useStore.getState();
      if (state.isAuthenticated && state.currentUser) {
        setReady(true);
        // fetchCurrentUser already calls connectSocket internally
      } else {
        logout();
        router.replace('/login');
      }
    }).catch(() => {
      logout();
      router.replace('/login');
    });
  }, []);

  if (!ready) return null; // no spinner — just blank for a frame

  return <>{children}</>;
}
