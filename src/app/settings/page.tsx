"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, RefreshCw, Settings2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardSidebar } from "@/components/modules/DashboardSidebar";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { BASE, api } from "@/lib/api";

export default function SettingsPage() {
  const { user, isReady } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xStatusLoading, setXStatusLoading] = useState(true);
  const [xConnected, setXConnected] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    api
      .checkXStatus()
      .then(({ connected }) => {
        setXConnected(connected);
      })
      .catch(() => {
        setLoadError("Could not load your settings. Please try again.");
      })
      .finally(() => setXStatusLoading(false));
  }, [isReady]);

  const handleReconnectX = () => {
    window.location.href = `${BASE}/auth/x/reconnect`;
  };

  if (!isReady || xStatusLoading) return <LoadingSpinner />;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#10060A] flex items-center justify-center px-4">
        <p className="text-red-400 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10060A] text-white">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <button
              className="lg:hidden text-white/60 hover:text-white flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Settings</h1>
              <p className="text-white/45 text-sm mt-1">
                Manage your profile setup and X account connection.
              </p>
            </div>
          </div>

          <div className="grid gap-4 max-w-4xl">
            <section className="rounded-2xl border border-[#1F2933] bg-[#0F1419] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#5C3FED]/30 bg-[#5C3FED]/15">
                    <Settings2 className="w-5 h-5 text-[#d6ccff]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Niche and Focus Areas</h2>
                    <p className="mt-1 max-w-xl text-sm text-white/50">
                      Update the niche and focus areas HackrPost uses to generate
                      content for your account.
                    </p>
                  </div>
                </div>
                <Link
                  href="/settings/profile"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "#5C3FED" }}
                >
                  Edit Profile Settings
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[#1F2933] bg-[#0F1419] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2933] bg-[#08060A]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">X Account</h2>
                    <p className="mt-1 max-w-xl text-sm text-white/50">
                      {xConnected
                        ? "Your X account is currently connected. Reconnect if you need to refresh access."
                        : "Your X account appears disconnected. Reconnect to restore posting and scheduling."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReconnectX}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "#5C3FED" }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconnect X account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
