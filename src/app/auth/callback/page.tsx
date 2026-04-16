"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, clearAuthToken, setAuthToken } from "@/lib/api";

const FALLBACK_AUTH_ERROR_MESSAGE =
  "We couldn't complete your sign-in. Please try again.";

function AuthCallbackLoadingState() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5C3FED] border-t-transparent" />
        <p className="font-geist text-sm text-white/60">Signing you in...</p>
      </div>
    </div>
  );
}

function AuthCallbackErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-6">
      <div className="w-full max-w-md rounded-[14px] border border-[#1F2933] bg-[#0F1419] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
        <div className="inline-flex rounded-full border border-[#88888AD9] bg-[#BABABA2E] px-3 py-1">
          <span className="font-geist text-xs text-[#F9FAFB]">
            Authentication Error
          </span>
        </div>
        <h1 className="mt-4 font-ibm-plex-serif text-2xl text-white">
          We couldn&apos;t sign you in
        </h1>
        <p className="mt-3 font-geist text-sm leading-6 text-white/70">
          {message}
        </p>
        <button
          type="button"
          onClick={() => window.location.replace("/signin")}
          className="mt-6 inline-flex items-center justify-center rounded-[10px] bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)] px-4 py-2 text-sm font-medium text-white shadow-[5px_5px_7.4px_0px_#1E103538] transition-shadow hover:shadow-[7px_7px_10px_0px_#1E103560]"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const token = searchParams.get("token");
  const errorMessage =
    error ?? (!token ? FALLBACK_AUTH_ERROR_MESSAGE : null);

  useEffect(() => {
    if (errorMessage) {
      clearAuthToken();
      return;
    }

    setAuthToken(token);

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
        router.replace("/signin");
      });
  }, [errorMessage, router, token]);

  if (errorMessage) {
    return <AuthCallbackErrorState message={errorMessage} />;
  }

  return <AuthCallbackLoadingState />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
