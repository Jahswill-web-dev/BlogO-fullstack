"use client";

import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/ui/pricingCard";

export function PricingPageContent() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-6 p-10">
      {/* Creator Plan */}
      <PricingCard
        title="Creator Plan"
        originalPrice="$29/mo"
        currentPrice="$19/mo"
        priceNote="First 50 users only — then $29/mo"
        features={[
          "4 posts per day",
          "120 posts/month",
          "Schedule up to 3 days",
        ]}
        ctaLabel="Start Free Trial"
        onCtaClick={() => router.push("/signup")}
      />

      {/* Builder Plan */}
      <PricingCard
        title="Builder Plan"
        originalPrice="$59/mo"
        currentPrice="$39/mo"
        priceNote="First 50 users only — then $59/mo"
        features={[
          "7 posts per day",
          "210 posts/month",
          "Schedule up to 1 week",
          // "Long form content (280+ characters)",
          "Priority support",
        ]}
        ctaLabel="Start Free Trial"
        highlighted={true}
        onCtaClick={() => router.push("/signup")}
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
        ctaLabel="Start Free Trial"
        onCtaClick={() => router.push("/signup")}
      />
    </div>
  );
}
