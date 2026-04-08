"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Guards a page behind authentication.
 *
 * - While the auth check is in flight: `isReady` is false → render spinner.
 * - If the check completes and there is no user: redirects to /signin and
 *   keeps `isReady` false so the page content never renders even for a
 *   single frame.
 * - Once the check completes with a valid user: `isReady` is true.
 *
 * Usage:
 *   const { user, isReady } = useProtectedRoute();
 *   if (!isReady) return <LoadingSpinner />;
 */
export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  const isReady = !loading && !!user;

  return { user, loading, isReady };
}
