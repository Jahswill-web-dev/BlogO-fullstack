"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  PlanKey,
  TrialAccessStatus,
  TrialPaywallPayload,
  isTrialExpiredError,
} from "@/lib/api";

const DEFAULT_PLANS: PlanKey[] = ["creator", "builder", "authority"];

function buildFallbackPaywall(
  accessStatus: TrialAccessStatus | null
): TrialPaywallPayload {
  return {
    reason: "plan_selection_required",
    requiresPayment: true,
    requiresPlanSelection: true,
    availablePlanIds: DEFAULT_PLANS,
    trialExpiresAt: accessStatus?.trialExpiresAt ?? null,
  };
}

function getTrialCountdownLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(msLeft) || msLeft <= 0) return null;

  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
  if (hoursLeft <= 24) {
    return `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} left in your trial`;
  }

  const daysLeft = Math.ceil(hoursLeft / 24);
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your trial`;
}

export function useTrialAccess(enabled = true) {
  const [accessStatus, setAccessStatus] = useState<TrialAccessStatus | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [paywall, setPaywall] = useState<TrialPaywallPayload | null>(null);

  const refreshAccessStatus = useCallback(async () => {
    if (!enabled) return null;

    setLoading(true);
    try {
      const nextStatus = await api.getTrialAccessStatus();
      setAccessStatus(nextStatus);
      return nextStatus;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    refreshAccessStatus().catch(() => {
      setLoading(false);
    });
  }, [enabled, refreshAccessStatus]);

  const openPaywall = useCallback(
    (payload?: TrialPaywallPayload | null) => {
      setPaywall({
        ...buildFallbackPaywall(accessStatus),
        ...(payload ?? {}),
        availablePlanIds:
          payload?.availablePlanIds?.length
            ? payload.availablePlanIds
            : buildFallbackPaywall(accessStatus).availablePlanIds,
        trialExpiresAt:
          payload?.trialExpiresAt ?? accessStatus?.trialExpiresAt ?? null,
      });
    },
    [accessStatus]
  );

  const closePaywall = useCallback(() => {
    setPaywall(null);
  }, []);

  const ensureAccess = useCallback(async () => {
    const current =
      accessStatus ?? (enabled ? await refreshAccessStatus().catch(() => null) : null);

    if (current && !current.hasAccess) {
      openPaywall();
      return false;
    }

    return true;
  }, [accessStatus, enabled, openPaywall, refreshAccessStatus]);

  const handleAccessError = useCallback(
    (error: unknown) => {
      if (!isTrialExpiredError(error)) return false;

      setAccessStatus((current) =>
        current
          ? { ...current, accessState: "trial_expired", hasAccess: false }
          : null
      );
      openPaywall(error.paywall);
      return true;
    },
    [openPaywall]
  );

  const trialCountdownLabel = useMemo(() => {
    if (accessStatus?.accessState !== "active_trial") return null;
    return getTrialCountdownLabel(accessStatus.trialExpiresAt);
  }, [accessStatus]);

  return {
    accessStatus,
    loading,
    paywall,
    showPaywall: !!paywall,
    trialCountdownLabel,
    refreshAccessStatus,
    ensureAccess,
    handleAccessError,
    openPaywall,
    closePaywall,
  };
}
