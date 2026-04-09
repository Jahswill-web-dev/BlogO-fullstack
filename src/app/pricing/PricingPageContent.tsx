"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PricingCard } from "@/components/ui/pricingCard";

export function PricingPageContent() {
  const [loadingPlan, setLoadingPlan] = useState<"creator" | "builder" | "authority" | null>(null);

  const handleCheckout = async (planId: "creator" | "builder" | "authority") => {
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
      {/* Creator Plan */}
      <PricingCard
        title="Creator Plan"
        originalPrice="$39/mo"
        currentPrice="$19/mo"
        priceNote="First 50 users only — then $39/mo"
        features={[
          "4 posts per day",
          "Schedule up to 3 days ahead",
        ]}
        ctaLabel={loadingPlan === "creator" ? "Redirecting…" : "Start Free Trial"}
        onCtaClick={() => handleCheckout("creator")}
        ctaDisabled={loadingPlan !== null}
      />

      {/* Builder Plan */}
      <PricingCard
        title="Builder Plan"
        originalPrice="$59/mo"
        currentPrice="$39/mo"
        priceNote="First 50 users only — then $59/mo"
        features={[
          "7 posts per day",
          "Schedule up to 1 week ahead",
          "Long form content (280+ characters)",
          "Priority support",
        ]}
        ctaLabel={loadingPlan === "builder" ? "Redirecting…" : "Start Free Trial"}
        highlighted={true}
        onCtaClick={() => handleCheckout("builder")}
        ctaDisabled={loadingPlan !== null}
      />

      {/* Authority Plan */}
      <PricingCard
        title="Authority Plan"
        originalPrice="$79/mo"
        currentPrice="$59/mo"
        priceNote="First 50 users only — then $79/mo"
        features={[
          "12 posts per day",
          "Schedule up to 2 weeks ahead",
          "Long form content (280+ characters)",
          "Priority support",
        ]}
        ctaLabel={loadingPlan === "authority" ? "Redirecting…" : "Start Free Trial"}
        onCtaClick={() => handleCheckout("authority")}
        ctaDisabled={loadingPlan !== null}
      />
    </div>
  );
}
