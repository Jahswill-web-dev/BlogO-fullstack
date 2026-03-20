"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
import { SocialMediaModal } from "@/components/modules/SocialMediaModal";

const PROBLEM_CHIPS = [
  "Finding early users for SaaS",
  "SEO for founders",
  "Marketing dev tools",
  "Building in public",
  "Shipping as a solo founder",
];

const AUDIENCE_CHIPS = [
  "Indie Hackers",
  "Startup Founders",
  "Developers",
  "Building in public",
  "Marketers",
];

type FormData = {
  problem: string;
  audience: string;
  hasProduct: "yes" | "no" | null;
  productDoes: string;
  productFor: string;
  productHelps: string;
};

export default function StartupOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    problem: "",
    audience: "",
    hasProduct: null,
    productDoes: "",
    productFor: "",
    productHelps: "",
  });

  const skipToPreview = () => setStep(4);

  const handleProductChoice = (choice: "yes" | "no") => {
    setFormData((prev) => ({ ...prev, hasProduct: choice }));
    if (choice === "no") {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handlePlatformSelect = (platform: string) => {
    console.log("Platform:", platform, "Form data:", formData);
    setIsModalOpen(false);
    router.push("/posts");
  };

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

      {/* Step 0 — What problem */}
      {step === 0 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
              What problem do you want to be known for?
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              This is the problem your ideal audience cares about — and the one your content will focus on.
            </p>
            <div className="flex flex-wrap gap-2 mb-1">
              {PROBLEM_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, problem: chip }))}
                  className="bg-[#1F2933] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer hover:bg-[#263241] transition"
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
                buttonLabel="Next"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(1)}
              />
            </div>
          </div>
        </>
      )}

      {/* Step 1 — Who struggles */}
      {step === 1 && (
        <>
          <PageHeader />
          <div className="bg-[#0F1419] border border-[#1F2933] rounded-2xl p-5 sm:p-8 w-full max-w-2xl">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">
              Who struggles with this problem?
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              We&apos;ll use this to tailor examples and language in your posts.
            </p>
            <div className="flex flex-wrap gap-2 mb-1">
              {AUDIENCE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, audience: chip }))}
                  className="bg-[#1F2933] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 cursor-pointer hover:bg-[#263241] transition"
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              value={formData.audience}
              onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}
              placeholder="E.g. SEO for startup founders"
              className="bg-black text-white rounded-xl p-3 sm:p-4 resize-none w-full min-h-[160px] sm:min-h-[200px] outline-none placeholder:text-gray-600 text-sm mt-3"
            />
            <div className="flex justify-between items-center mt-5 sm:mt-6">
              <button
                onClick={() => setStep(0)}
                className="text-white/60 hover:text-white text-sm transition"
              >
                Back
              </button>
              <GradientButton
                buttonLabel="Next"
                className="px-5 sm:px-6 py-2 text-sm"
                onClick={() => setStep(2)}
              />
            </div>
          </div>
        </>
      )}

      {/* Step 2 — Product check */}
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

      {/* Step 3 — Product details */}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productDoes: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productFor: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productHelps: e.target.value }))
                  }
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

      {/* Step 4 — Preview */}
      {step === 4 && (
        <div className="flex flex-col items-center w-full max-w-lg text-center px-2">
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
          <GradientButton
            buttonLabel="Generate My Content"
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          />
          <button
            onClick={() => router.push("/posts")}
            className="text-gray-400 text-xs sm:text-sm mt-4 hover:text-white transition"
          >
            Go to Dashboard
          </button>
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
