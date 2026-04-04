"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FIXED_NICHES } from "@/lib/niches";

const AUDIENCE_OPTIONS = [
  "Indie hackers",
  "Startup founders",
  "Developers",
  "Marketers",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Form state type                                                     */
/* ------------------------------------------------------------------ */
type FormData = {
  // maps to backend: userNiche
  problem: string;
  // maps to backend: targetAudience
  audience: string;
  // maps to backend: focusArea
  nicheArea: string;
  hasProduct: "yes" | "no" | null;
  // maps to backend: productDescription
  productDoes: string;
  // maps to backend: productAudience
  productFor: string;
  // maps to backend: productSolution
  productHelps: string;
};

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function StartupOnboarding() {
  const router = useRouter();
  const { loggedIn, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    problem: "",
    audience: "",
    nicheArea: "",
    hasProduct: null,
    productDoes: "",
    productFor: "",
    productHelps: "",
  });
  // "Other" free-text for audience
  const [audienceOther, setAudienceOther] = useState("");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !loggedIn) router.replace("/signin");
  }, [authLoading, loggedIn, router]);

  if (authLoading) return <LoadingSpinner />;

  const skipToPreview = () => setStep(4);

  const handleProductChoice = (choice: "yes" | "no") => {
    setFormData((prev) => ({ ...prev, hasProduct: choice }));
    setStep(choice === "no" ? 4 : 3);
  };

  // Resolve final audience value (handles "Other" free text)
  const resolvedAudience =
    formData.audience === "Other"
      ? audienceOther.trim() || "Other"
      : formData.audience;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      await api.saveProfile({
        userNiche:          formData.problem,
        targetAudience:     resolvedAudience,
        focusArea:          formData.nicheArea,
        productDescription: formData.productDoes  || undefined,
        productAudience:    formData.productFor    || undefined,
        productSolution:    formData.productHelps  || undefined,
      });
      await api.generateContentStrategy();
      await api.generatePosts(10);
      router.push("/dashboard?schedule=true");
    } catch {
      setGenError("Content generation failed. Please try again.");
      setGenerating(false);
    }
  };

  const selectedNiche = FIXED_NICHES.find((n) => n.name === formData.problem);

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-b from-[#10060A] via-[#10060A] to-[#5C3FED] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 relative"
    >
      {/* Skip button */}
      {step < 3 && (
        <button
          onClick={skipToPreview}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#1F2933] text-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-[#263241] transition"
        >
          Skip
        </button>
      )}

      {/* ── Step 0 — Pick niche + focus area ── */}
      {step === 0 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-4">
              What Niche Content do you want to be known for?
            </h2>

            {/* Niche chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {FIXED_NICHES.map((niche) => (
                <button
                  key={niche.name}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      problem: niche.name,
                      nicheArea: "",
                    }))
                  }
                  className={`text-sm rounded-full px-4 py-2 cursor-pointer transition border ${
                    formData.problem === niche.name
                      ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                      : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                  }`}
                >
                  {niche.name}
                </button>
              ))}
            </div>

            {/* Focus area reveal */}
            {formData.problem && (
              <div className="border-t border-[#1F2933] pt-5 mb-5">
                <p className="text-gray-400 text-xs sm:text-sm mb-3">
                  Which area of{" "}
                  <span className="text-white">{formData.problem}</span> do you
                  want to focus on?
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedNiche?.focusAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, nicheArea: area }))
                      }
                      className={`text-xs sm:text-sm rounded-full px-3 py-1.5 cursor-pointer transition border ${
                        formData.nicheArea === area
                          ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                          : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <GradientButton
                buttonLabel="Continue"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(1)}
                disabled={!formData.problem || !formData.nicheArea}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Step 1 — Your audience ── */}
      {step === 1 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
              Who are you trying to attract?
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-5">
              We&apos;ll use this to tailor examples and language in your posts.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, audience: option }))}
                  className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition border ${
                    formData.audience === option
                      ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                      : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {formData.audience === "Other" && (
              <input
                type="text"
                value={audienceOther}
                onChange={(e) => setAudienceOther(e.target.value)}
                placeholder="Describe your audience..."
                autoFocus
                className="w-full bg-black text-white rounded-xl px-4 py-3 outline-none placeholder:text-gray-600 text-sm border border-[#1F2933] focus:border-[#5C3FED] transition"
              />
            )}

            <div className="flex justify-between items-center mt-5 sm:mt-6">
              <button
                onClick={() => setStep(0)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
              <GradientButton
                buttonLabel="Continue"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(2)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Step 2 — Product check ── */}
      {step === 2 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
              Do you have a product related to this problem?{" "}
              <span className="text-gray-400 font-normal text-sm sm:text-base">(Optional)</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6">
              This helps us add relevant context and soft product mentions. You can skip this.
            </p>
            <div className="space-y-1">
              {(["yes", "no"] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleProductChoice(choice)}
                  className="flex items-center gap-3 py-3 w-full cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      formData.hasProduct === choice
                        ? "border-[#5C3FED]"
                        : "border-white/30 group-hover:border-white/50"
                    }`}
                  >
                    {formData.hasProduct === choice && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5C3FED]" />
                    )}
                  </div>
                  <span className="text-white text-sm">
                    {choice === "yes" ? "Yes, I have a product" : "Not yet"}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Step 3 — Product details ── */}
      {step === 3 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-5 sm:mb-6">
              Product details
            </h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-gray-300 text-xs sm:text-sm mb-2 block">
                  What does your product do?
                </label>
                <input
                  type="text"
                  value={formData.productDoes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productDoes: e.target.value }))}
                  placeholder="A short description of what you're building"
                  className="w-full bg-[#1F2933] text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none placeholder:text-gray-500 text-sm border border-[#1F2933] focus:border-[#5C3FED] transition"
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs sm:text-sm mb-2 block">
                  Who is it for?
                </label>
                <input
                  type="text"
                  value={formData.productFor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productFor: e.target.value }))}
                  placeholder="E.g. early-stage SaaS founders"
                  className="w-full bg-[#1F2933] text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none placeholder:text-gray-500 text-sm border border-[#1F2933] focus:border-[#5C3FED] transition"
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs sm:text-sm mb-2 block">
                  How does it help with this problem?
                </label>
                <input
                  type="text"
                  value={formData.productHelps}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productHelps: e.target.value }))}
                  placeholder="E.g. helps founders find SEO opportunities faster"
                  className="w-full bg-[#1F2933] text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none placeholder:text-gray-500 text-sm border border-[#1F2933] focus:border-[#5C3FED] transition"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 sm:mt-8">
              <button
                onClick={() => setStep(2)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
              <GradientButton
                buttonLabel="Done"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(4)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Step 4 — Preview / Generate ── */}
      {step === 4 && (
        <div className="flex flex-col items-center w-full max-w-lg text-center px-2">
          {generating ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-[#5C3FED] border-t-transparent animate-spin mb-6" />
              <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-2">
                Generating your content…
              </h1>
              <p className="text-gray-400 text-sm">This may take a few seconds</p>
            </>
          ) : (
            <>
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 leading-tight">
                Here&apos;s what we&apos;ll generate for you
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mb-8 sm:mb-10">
                You can edit everything later
              </p>
              <ul className="space-y-3 mb-8 sm:mb-10 text-left w-full max-w-xs sm:max-w-sm">
                {[
                  "Content pillars around your problem space",
                  "Subtopics your audience cares about",
                  "X posts designed to attract the right people",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-400 text-sm sm:text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {genError && (
                <p className="text-red-400 text-sm mb-4">{genError}</p>
              )}
              <GradientButton
                buttonLabel="Generate My Content"
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleGenerate}
              />
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 text-xs sm:text-sm mt-4 hover:text-white transition"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-6 sm:mb-8 text-center px-2">
      <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-2 leading-tight">
        Tell Us About What You&apos;re Building
      </h1>
      <p className="text-gray-400 text-xs sm:text-sm">
        Help us tailor your experience for the best results
      </p>
    </div>
  );
}
