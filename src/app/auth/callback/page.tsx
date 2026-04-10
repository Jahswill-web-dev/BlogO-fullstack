"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setAuthToken(token);
    }

    api
      .getMe()
      .then(() => {
        api
          .getProfile()
          .then(() => router.replace("/dashboard"))
          .catch((err: unknown) => {
            if ((err as { status?: number }).status === 404) {
              router.replace("/startup");
            } else {
              router.replace("/signin");
            }
          });
      })
      .catch(() => {
        // Token invalid or missing — send to signin
        router.replace("/signin");
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#5C3FED] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-geist">Signing you in…</p>
      </div>
    </div>
  );
}
