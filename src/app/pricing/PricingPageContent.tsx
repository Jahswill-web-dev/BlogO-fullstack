"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PricingCard } from "@/components/ui/pricingCard";

export function PricingPageContent() {
  const [loadingPlan, setLoadingPlan] = useState<"builder" | "authority" | null>(null);

  const handleCheckout = async (planId: "builder" | "authority") => {
    if (loadingPlan) return;
    setLoadingPlan(planId);
    try {
      const { checkoutUrl } = await api.checkout(planId);
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error((err as Error).message || "Could not start checkout. Try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-6 p-10">
      {/* Creator / Basic — free tier */}
      <PricingCard
        title="Basic Plan"
        currentPrice="$9/month"
        features={[
          "3 posts per day",
          "Schedule 1 week ahead",
        ]}
        ctaLabel="Get Started Free"
        onCtaClick={() => { window.location.href = "/dashboard"; }}
      />

      {/* Builder / Pro */}
      <PricingCard
        title="Pro Plan"
        originalPrice="$19/month"
        currentPrice="$39/year"
        priceNote="First 100 users only"
        features={[
          "7 posts per day",
          "Priority support",
          "Long form content (280+ characters)",
          "Schedule 2 weeks ahead",
        ]}
        ctaLabel={loadingPlan === "builder" ? "Redirecting…" : "Get Pro for $39"}
        highlighted={true}
        onCtaClick={() => handleCheckout("builder")}
        ctaDisabled={loadingPlan !== null}
      />

      {/* Authority / Hacker */}
      <PricingCard
        title="Hacker Plan"
        currentPrice="$39/month"
        features={[
          "20 posts per day",
          "Priority support",
          "Long form content (280+ characters)",
          "Schedule 4 weeks ahead",
        ]}
        ctaLabel={loadingPlan === "authority" ? "Redirecting…" : "Get Hacker for $39"}
        onCtaClick={() => handleCheckout("authority")}
        ctaDisabled={loadingPlan !== null}
      />
    </div>
  );
}
