"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
import { SocialMediaModal } from "@/components/modules/SocialMediaModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Static chip data                                                    */
/* ------------------------------------------------------------------ */
const NICHE_CHIPS = [
  "Finding early users for SaaS",
  "SEO for founders",
  "Marketing dev tools",
  "Building in public",
  "Shipping as a solo founder",
];

const AUDIENCE_OPTIONS = [
  "Indie hackers",
  "Startup founders",
  "Developers",
  "Marketers",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Dynamic focus-area mapping                                          */
/*  Keys are lowercase substrings to match against the niche input.    */
/* ------------------------------------------------------------------ */
const NICHE_FOCUS_MAP: { keywords: string[]; areas: string[] }[] = [
  {
    keywords: ["seo", "search engine"],
    areas: ["Getting traffic", "Keyword research", "Technical SEO", "Content strategy", "Link building", "Programmatic SEO"],
  },
  {
    keywords: ["early user", "user acquisition", "saas growth"],
    areas: ["Community building", "Cold outreach", "Product Hunt launch", "Twitter/X growth", "Referral programs", "Waitlist building"],
  },
  {
    keywords: ["marketing", "dev tool", "developer tool"],
    areas: ["Developer advocacy", "Technical content", "Case studies", "Community building", "API guides", "Documentation"],
  },
  {
    keywords: ["building in public", "build in public"],
    areas: ["Journey sharing", "Metrics sharing", "Behind the scenes", "Lessons learned", "Product updates", "Audience building"],
  },
  {
    keywords: ["solo founder", "indie", "bootstrap"],
    areas: ["Productivity", "Tech stack", "Launch strategies", "Revenue growth", "Time management", "Automation"],
  },
  {
    keywords: ["developer", "coding", "programming", "engineer"],
    areas: ["Open source", "Technical writing", "API design", "Code tutorials", "Architecture", "Side projects"],
  },
  {
    keywords: ["content", "creator", "writing"],
    areas: ["Audience growth", "Newsletter", "Repurposing content", "Content systems", "Monetisation", "Distribution"],
  },
];

const DEFAULT_FOCUS_AREAS = [
  "Thought leadership",
  "Case studies",
  "How-to guides",
  "Tools & resources",
  "Beginner tutorials",
  "Community building",
];

function getFocusAreas(niche: string): string[] {
  const lower = niche.toLowerCase();
  for (const entry of NICHE_FOCUS_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.areas;
    }
  }
  return DEFAULT_FOCUS_AREAS;
}

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
/*  AI-powered focus area step                                          */
/* ------------------------------------------------------------------ */
type FocusAreaStepProps = {
  niche: string;
  audience: string;
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function FocusAreaStep({ niche, audience, value, onChange, onBack, onNext }: FocusAreaStepProps) {
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherText, setOtherText] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["focus-areas", niche, audience],
    queryFn: () => api.suggestFocusAreas(niche, audience),
    enabled: !!(niche && audience),
    staleTime: 1000 * 60 * 10, // cache for 10 min
  });

  const chips: string[] = data?.focusAreas ?? [];

  const handleChipClick = (chip: string) => {
    setOtherSelected(false);
    onChange(chip);
  };

  const handleOtherClick = () => {
    setOtherSelected(true);
    onChange(otherText);
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherText(e.target.value);
    onChange(e.target.value);
  };

  const canContinue = otherSelected ? otherText.trim().length > 0 : value.length > 0;

  return (
    <>
      <PageHeader />
      <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
        <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
          What area of this niche do you want to focus on most?
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-5">
          We&apos;ll build your content strategy around this.
        </p>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-full bg-[#1F2933] animate-pulse"
                style={{ width: `${80 + (i % 3) * 30}px` }}
              />
            ))}
          </div>
        )}

        {/* Error fallback */}
        {isError && !isLoading && (
          <p className="text-gray-400 text-sm mb-4">
            Couldn&apos;t generate suggestions. Type your own below.
          </p>
        )}

        {/* AI-generated chips */}
        {!isLoading && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition border ${
                  value === chip && !otherSelected
                    ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                    : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                }`}
              >
                {chip}
              </button>
            ))}

            {/* Other chip — always visible */}
            <button
              type="button"
              onClick={handleOtherClick}
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition border ${
                otherSelected
                  ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                  : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
              }`}
            >
              Other (type your own)
            </button>
          </div>
        )}

        {/* Show "Other" chip alone when no AI chips loaded (error/no data) and not loading */}
        {!isLoading && chips.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={handleOtherClick}
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition border ${
                otherSelected
                  ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                  : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
              }`}
            >
              Other (type your own)
            </button>
          </div>
        )}

        {/* Free-text input when "Other" is selected */}
        {otherSelected && (
          <input
            type="text"
            value={otherText}
            onChange={handleOtherTextChange}
            placeholder="Describe your focus area…"
            autoFocus
            className="w-full bg-black text-white rounded-xl px-4 py-3 outline-none placeholder:text-gray-600 text-sm border border-[#1F2933] focus:border-[#5C3FED] transition mb-2"
          />
        )}

        <div className="flex justify-between items-center mt-5 sm:mt-6">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white text-sm transition"
          >
            Back
          </button>
          <GradientButton
            buttonLabel="Continue"
            className="px-5 sm:px-6 py-2 text-sm"
            onClick={onNext}
            disabled={!canContinue}
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function StartupOnboarding() {
  const router = useRouter();
  const { loggedIn, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const skipToPreview = () => setStep(5);

  const handleProductChoice = (choice: "yes" | "no") => {
    setFormData((prev) => ({ ...prev, hasProduct: choice }));
    setStep(choice === "no" ? 5 : 4);
  };

  // Resolve final audience value (handles "Other" free text)
  const resolvedAudience =
    formData.audience === "Other"
      ? audienceOther.trim() || "Other"
      : formData.audience;

  const handlePlatformSelect = async (_platform: string) => {
    setIsModalOpen(false);
    setGenerating(true);
    setGenError(null);
    try {
      // POST /profile — maps onboarding fields to backend schema
      await api.saveProfile({
        userNiche:          formData.problem,
        targetAudience:     resolvedAudience,
        focusArea:          formData.nicheArea,
        productDescription: formData.productDoes  || undefined,
        productAudience:    formData.productFor    || undefined,
        productSolution:    formData.productHelps  || undefined,
      });

      // Full AI generation pipeline (each step reads from DB — no body needed)
      await api.generateSaasProfile();
      await api.generateCategories();
      await api.generateSubtopics();
      await api.generatePosts(10);

      router.push("/dashboard");
    } catch {
      setGenError("Content generation failed. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-b from-[#10060A] via-[#10060A] to-[#5C3FED] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 relative"
    >
      {/* Skip button */}
      {step < 4 && (
        <button
          onClick={skipToPreview}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#1F2933] text-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-[#263241] transition"
        >
          Skip
        </button>
      )}

      {/* ── Step 0 — Define your niche ── */}
      {step === 0 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-4">
              What Niche Content do you want to be known for?
            </h2>
            <div className="flex flex-wrap gap-2 mb-1">
              {NICHE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, problem: chip }))}
                  className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition border ${
                    formData.problem === chip
                      ? "bg-[#5C3FED]/20 border-[#5C3FED] text-white"
                      : "bg-[#1F2933] border-transparent text-white hover:bg-[#263241]"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              value={formData.problem}
              onChange={(e) => setFormData((prev) => ({ ...prev, problem: e.target.value }))}
              placeholder="E.g. SEO for startup founders"
              className="bg-black text-white rounded-xl p-3 sm:p-4 resize-none w-full min-h-[160px] sm:min-h-[200px] outline-none placeholder:text-gray-600 text-sm mt-3"
            />
            <div className="flex justify-end mt-5 sm:mt-6">
              <GradientButton
                buttonLabel="Continue"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(1)}
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

            {/* Audience option chips */}
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

            {/* Free-text input when "Other" is selected */}
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

      {/* ── Step 2 — Niche focus area (AI-powered) ── */}
      {step === 2 && (
        <FocusAreaStep
          niche={formData.problem}
          audience={resolvedAudience}
          value={formData.nicheArea}
          onChange={(v) => setFormData((prev) => ({ ...prev, nicheArea: v }))}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {/* ── Step 3 — Product check ── */}
      {step === 3 && (
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
                onClick={() => setStep(2)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Step 4 — Product details ── */}
      {step === 4 && (
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
                onClick={() => setStep(3)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
              <GradientButton
                buttonLabel="Done"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(5)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Step 5 — Preview / Generate ── */}
      {step === 5 && (
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
                onClick={() => setIsModalOpen(true)}
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

      <SocialMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handlePlatformSelect}
      />
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
