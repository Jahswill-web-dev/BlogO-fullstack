"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { api } from "@/lib/api";
import { FIXED_NICHES } from "@/lib/niches";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { isReady } = useProtectedRoute();

  const [profileLoading, setProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const [subStep, setSubStep] = useState<0 | 1>(0);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    api
      .getProfile()
      .then((profile) => {
        const parsed = profile.focusArea
          ? profile.focusArea
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedNiche(profile.userNiche ?? "");
        setSelectedFocusAreas(parsed);
      })
      .catch(() => {
        setLoadError("Could not load your profile. Please try again.");
      })
      .finally(() => setProfileLoading(false));
  }, [isReady]);

  const handleSave = async () => {
    if (!selectedNiche.trim()) {
      setSaveError("Please select a niche.");
      return;
    }
    if (selectedFocusAreas.length === 0) {
      setSaveError("Please select at least one focus area.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await api.saveProfile({
        userNiche: selectedNiche,
        focusArea: selectedFocusAreas.join(","),
      });
      setSaveSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to save changes. Please try again.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (!isReady || profileLoading) return <LoadingSpinner />;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#10060A] flex items-center justify-center">
        <p className="text-red-400 text-sm">{loadError}</p>
      </div>
    );
  }

  const currentNicheData = FIXED_NICHES.find((n) => n.name === selectedNiche);

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-b from-[#10060A] via-[#10060A] to-[#5C3FED] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 relative"
    >
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-2">
          Settings
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Update your niche and focus areas
        </p>
      </div>

      {/* ── Sub-step 0 — Niche picker ── */}
      {subStep === 0 && (
        <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
          <h2 className="text-white font-bold text-lg sm:text-xl mb-2">
            Your Niche
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-5">
            Change the niche you create content for.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {FIXED_NICHES.map((niche) => (
              <button
                key={niche.name}
                type="button"
                onClick={() => {
                  setSelectedNiche(niche.name);
                  setSelectedFocusAreas([]);
                  setSaveSuccess(false);
                }}
                className={cn(
                  "text-sm rounded-full px-4 py-2 cursor-pointer transition border",
                  selectedNiche === niche.name
                    ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                    : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                )}
              >
                {niche.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="text-white/60 hover:text-white text-sm transition"
            >
              Back
            </button>
            <GradientButton
              buttonLabel="Next: Focus Areas"
              className="px-5 sm:px-6 py-2 text-sm"
              onClick={() => setSubStep(1)}
              disabled={!selectedNiche}
            />
          </div>
        </div>
      )}

      {/* ── Sub-step 1 — Focus area picker ── */}
      {subStep === 1 && (
        <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
          {/* Selected niche badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#5C3FED]/20 border border-[#5C3FED]/40 text-[#a090ff] text-xs px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C3FED]" />
              {selectedNiche}
            </span>
          </div>

          <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
            Your Focus Areas
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Select up to 3 areas you want to create content about.
          </p>

          {/* Scrollable focus area list */}
          <div className="max-h-72 overflow-y-auto pr-1 mb-5 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#1F2933] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#5C3FED]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#5C3FED]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {currentNicheData?.focusAreas.map((area) => {
                const isChecked = selectedFocusAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() =>
                      setSelectedFocusAreas((prev) =>
                        isChecked
                          ? prev.filter((a) => a !== area)
                          : prev.length < 3
                          ? [...prev, area]
                          : prev
                      )
                    }
                    disabled={!isChecked && selectedFocusAreas.length >= 3}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition border",
                      isChecked
                        ? "bg-[#5C3FED]/10 border-[#5C3FED]/40 text-white cursor-pointer"
                        : selectedFocusAreas.length >= 3
                        ? "bg-transparent border-transparent text-gray-600 cursor-not-allowed"
                        : "bg-transparent border-transparent text-gray-300 hover:bg-[#1F2933] hover:text-white cursor-pointer"
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        "w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition",
                        isChecked
                          ? "border-[#5C3FED] bg-[#5C3FED]/20"
                          : "border-white/20"
                      )}
                    >
                      {isChecked && (
                        <span className="w-2 h-2 rounded-sm bg-[#5C3FED]" />
                      )}
                    </span>
                    <span className="text-xs sm:text-sm leading-snug">
                      {area}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-sm mb-3">{saveError}</p>
          )}
          {saveSuccess && (
            <div className="mb-4 rounded-xl border border-[#5C3FED]/40 bg-[#5C3FED]/10 p-4">
              <p className="text-white text-sm font-medium">
                Changes saved successfully.
              </p>
              <p className="mt-1 text-gray-300 text-xs sm:text-sm">
                Your niche and focus areas are updated. Go to your dashboard and start generating posts.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <GradientButton
                  buttonLabel="Go to Dashboard"
                  className="px-5 py-2 text-sm"
                  onClick={handleGoToDashboard}
                />
                <button
                  type="button"
                  onClick={() => setSaveSuccess(false)}
                  className="rounded-[4px] border border-[#1F2933] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#1F2933] hover:text-white"
                >
                  Stay here
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSubStep(0);
                setSaveError(null);
                setSaveSuccess(false);
              }}
              className="text-white/60 hover:text-white text-sm transition"
            >
              Back
            </button>
            <GradientButton
              buttonLabel={saving ? "Saving..." : "Save Changes"}
              className="px-5 sm:px-6 py-2 text-sm"
              onClick={handleSave}
              disabled={saving || selectedFocusAreas.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
