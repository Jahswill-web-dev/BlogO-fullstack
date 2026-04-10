"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PricingCard } from "@/components/ui/pricingCard";

export function PricingPageContent() {
  const [loadingPlan, setLoadingPlan] = useState<"builder" | "authority" | null>(null);
  const router = useRouter();

  const handleCheckout = async (planId: "builder" | "authority") => {
    if (loadingPlan) return;
    setLoadingPlan(planId);
    try {
      await api.getMe();
      const { checkoutUrl } = await api.checkout(planId);
      window.location.href = checkoutUrl;
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        router.push("/signin?redirect=/pricing");
        return;
      }
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
        currentPrice="$29/mo"
        priceNote="First 50 users only — then $39/mo"
        features={[
          "4 posts per day",
          "120 posts/month",
          "Schedule up to 3 days",
        ]}
        ctaLabel="Start Free Trial"
        onCtaClick={() => router.push("/signup")}
        ctaDisabled={loadingPlan !== null}
      />

      {/* Builder Plan */}
      <PricingCard
        title="Builder Plan"
        originalPrice="$59/mo"
        currentPrice="$49/mo"
        priceNote="First 50 users only — then $59/mo"
        features={[
          "7 posts per day",
          "210 posts/month",
          "Schedule up to 1 week",
          // "Long form content (280+ characters)",
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
        currentPrice="$69/mo"
        priceNote="First 50 users only — then $79/mo"
        features={[
          "12 posts per day",
          "360 posts/month",
          "Schedule up to 2 weeks",
          // "Long form content (280+ characters)",
          "Priority support",
        ]}
        ctaLabel={loadingPlan === "authority" ? "Redirecting…" : "Start Free Trial"}
        onCtaClick={() => handleCheckout("authority")}
        ctaDisabled={loadingPlan !== null}
      />
    </div>
  );
}
