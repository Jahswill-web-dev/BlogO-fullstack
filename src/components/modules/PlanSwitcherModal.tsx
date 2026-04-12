"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type PlanKey = "creator" | "builder" | "authority";

interface PlanSwitcherModalProps {
  currentPlan: PlanKey;
  hasActiveSubscription: boolean;
  onClose: () => void;
  onPlanChange: () => void;
  title?: string;
  subtitle?: string;
}

const PLANS: {
  key: PlanKey;
  name: string;
  postsPerDay: number;
  scheduleDays: number;
  features: string[];
}[] = [
  {
    key: "creator",
    name: "Creator",
    postsPerDay: 4,
    scheduleDays: 3,
    features: ["4 posts per day", "Schedule 3 days ahead", "Default plan"],
  },
  {
    key: "builder",
    name: "Builder",
    postsPerDay: 7,
    scheduleDays: 7,
    features: ["7 posts per day", "Schedule 1 week ahead", "Priority support"],
  },
  {
    key: "authority",
    name: "Authority",
    postsPerDay: 12,
    scheduleDays: 14,
    features: [
      "12 posts per day",
      "Schedule 2 weeks ahead",
      "Priority support",
    ],
  },
];

export function PlanSwitcherModal({
  currentPlan,
  hasActiveSubscription,
  onClose,
  onPlanChange,
  title = "Change plan",
  subtitle = "Select a plan to switch to",
}: PlanSwitcherModalProps) {
  const [switching, setSwitching] = useState<PlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSelect = async (plan: PlanKey) => {
    if (plan === currentPlan || switching) return;
    setSwitching(plan);
    try {
      if (plan === "creator") {
        // Downgrade to free — direct update
        await api.updateUserPlan("creator");
        toast.success("Switched to Creator plan");
        onPlanChange();
        onClose();
      } else {
        // Paid plan — redirect to Polar checkout
        const { checkoutUrl } = await api.checkout(plan);
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong. Try again.");
      setSwitching(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { portalUrl } = await api.getBillingPortal();
      window.location.href = portalUrl;
    } catch (err) {
      toast.error((err as Error).message || "Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-2xl border p-6"
          style={{ background: "#0B0F19", borderColor: "#1F2933" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-white/40 mt-0.5">
                {subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.key === currentPlan;
              const isLoading = switching === plan.key;

              return (
                <button
                  key={plan.key}
                  onClick={() => handleSelect(plan.key)}
                  disabled={isCurrent || switching !== null}
                  className={cn(
                    "relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-150",
                    isCurrent
                      ? "cursor-default"
                      : switching !== null
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-[#5C3FED] hover:bg-[#5C3FED]/5 cursor-pointer"
                  )}
                  style={{
                    borderColor: isCurrent ? "#5C3FED" : "#1F2933",
                    background: isCurrent ? "rgba(92,63,237,0.08)" : "#0F1419",
                  }}
                >
                  {/* Current badge */}
                  {isCurrent && (
                    <span
                      className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: "#2d2650",
                        color: "#d6ccff",
                        border: "1px solid #9d8ee8",
                      }}
                    >
                      Current
                    </span>
                  )}

                  {/* Plan name */}
                  <span className="text-base font-semibold text-white mb-1">
                    {plan.name}
                  </span>

                  {/* Stats */}
                  <span className="text-xs text-white/40 mb-4">
                    {plan.postsPerDay} posts/day &middot; {plan.scheduleDays}-day window
                  </span>

                  {/* Features */}
                  <ul className="space-y-1.5 w-full">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-xs text-white/60"
                      >
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Select / loading indicator */}
                  {!isCurrent && (
                    <div className="mt-4 w-full">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border-2 animate-spin flex-shrink-0"
                            style={{
                              borderColor: "#5C3FED",
                              borderTopColor: "transparent",
                            }}
                          />
                          {plan.key === "creator" ? "Switching…" : "Redirecting…"}
                        </div>
                      ) : (
                        <span
                          className="block w-full text-center text-xs font-medium py-1.5 rounded-lg transition-colors"
                          style={{
                            background: "rgba(92,63,237,0.15)",
                            color: "#9d8ee8",
                          }}
                        >
                          {plan.key === "creator" ? `Select ${plan.name}` : `Upgrade to ${plan.name}`}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manage Billing — only for active subscribers */}
          {hasActiveSubscription && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "#1F2933" }}>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 animate-spin flex-shrink-0"
                    style={{ borderColor: "#5C3FED", borderTopColor: "transparent" }}
                  />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                Manage billing &amp; subscription
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
