"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ChevronLeft, AlertTriangle } from "lucide-react";
import { FIXED_NICHES } from "@/lib/niches";
import { api } from "@/lib/api";
import { PlanUsageBar } from "./PlanUsageBar";
import { ScheduleDatePicker } from "./ScheduleDatePicker";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PlanKey = "creator" | "builder" | "authority";

interface PlanData {
  plan: PlanKey;
  postsPerDay: number;
  scheduleDaysAhead: number;
  usedToday: number;
  remainingToday: number;
}

interface DateUsage {
  used: number;
  limit: number;
  withinWindow: boolean;
}

interface GeneratePanelProps {
  isOpen: boolean;
  onClose: () => void;
  userNiche: string;
  isGenerating?: boolean;
  targetDate?: Date;
  onGenerate: (params: {
    niche: string;
    focusArea: string;
    slideCount: number;
    scheduledFor: Date;
  }) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const PLAN_DISPLAY_NAMES: Record<PlanKey, string> = {
  creator: "Creator",
  builder: "Builder",
  authority: "Authority",
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

const mobileVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const MIN_SLIDES = 1;
const MAX_SLIDES = 15;
const PRESET_SLIDES = [4, 7, 12];

/* ------------------------------------------------------------------ */
/*  Shared pill styles                                                  */
/* ------------------------------------------------------------------ */

const pillBase: React.CSSProperties = {
  background: "#1e1e2a",
  border: "1px solid #2e2e3e",
  color: "#ccc",
  borderRadius: 999,
  padding: "7px 14px",
  fontSize: 13,
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s, color 0.15s",
  whiteSpace: "nowrap" as const,
};

const pillSelected: React.CSSProperties = {
  ...pillBase,
  border: "1px solid #9d8ee8",
  background: "#2d2650",
  color: "#d6ccff",
};

/* ------------------------------------------------------------------ */
/*  Inner panel content (shared between desktop & mobile)              */
/* ------------------------------------------------------------------ */

function PanelContent({
  onClose,
  userNiche,
  onGenerate,
  isGenerating,
  planData,
  usageByDate,
  selectedScheduleDate,
  onDateSelect,
  onUsageUpdate,
}: {
  onClose: () => void;
  userNiche: string;
  isGenerating?: boolean;
  planData: PlanData | null;
  usageByDate: Record<string, DateUsage>;
  selectedScheduleDate: Date;
  onDateSelect: (date: Date) => void;
  onUsageUpdate: (date: Date) => void;
  onGenerate: GeneratePanelProps["onGenerate"];
}) {
  const [selectedNiche, setSelectedNiche] = useState(userNiche);
  const [selectedFocus, setSelectedFocus] = useState(() => {
    const niche = FIXED_NICHES.find((n) => n.name === userNiche);
    return niche?.focusAreas[0] ?? "";
  });
  const [slideCount, setSlideCount] = useState(7);
  const [showAllFocus, setShowAllFocus] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Re-initialise whenever the panel (re-)opens with a potentially different userNiche
  useEffect(() => {
    setSelectedNiche(userNiche);
    const niche = FIXED_NICHES.find((n) => n.name === userNiche);
    setSelectedFocus(niche?.focusAreas[0] ?? "");
    setSlideCount(7);
    setShowAllFocus(false);
    setGenerationError(null);
  }, [userNiche]);

  const handleNicheSelect = (nicheName: string) => {
    setSelectedNiche(nicheName);
    const niche = FIXED_NICHES.find((n) => n.name === nicheName);
    setSelectedFocus(niche?.focusAreas[0] ?? "");
    setShowAllFocus(false);
  };

  const decrement = () => setSlideCount((c) => Math.max(MIN_SLIDES, c - 1));
  const increment = () => setSlideCount((c) => Math.min(MAX_SLIDES, c + 1));

  const currentFocusAreas =
    FIXED_NICHES.find((n) => n.name === selectedNiche)?.focusAreas ?? [];

  // Determine if the selected date has hit its limit
  const selectedDateKey = toDateKey(selectedScheduleDate);
  const selectedDateUsage = usageByDate[selectedDateKey];
  const isLimitReached =
    selectedDateUsage != null &&
    selectedDateUsage.used >= selectedDateUsage.limit;

  const canGenerate =
    !!selectedNiche && !!selectedFocus && !isGenerating && !isLimitReached;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerationError(null);
    try {
      await onGenerate({
        niche: selectedNiche,
        focusArea: selectedFocus,
        slideCount,
        scheduledFor: selectedScheduleDate,
      });
      // Optimistic: increment usage count for the selected date
      onUsageUpdate(selectedScheduleDate);
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 403) {
        const dateStr = selectedScheduleDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        setGenerationError(
          `You've reached your limit for ${dateStr}. Upgrade your plan to generate more.`
        );
      }
    }
  };

  // Today's usage for the usage bar (always "today", regardless of selected date)
  const todayKey = toDateKey(new Date());
  const todayUsage = usageByDate[todayKey];
  const todayUsed = todayUsage?.used ?? planData?.usedToday ?? 0;
  const todayLimit = todayUsage?.limit ?? planData?.postsPerDay ?? 0;

  return (
    <div
      style={{
        background: "#13131a",
        border: "1px solid #2a2a3a",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ---- Header ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #1e1e2a",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
          Create niche post
        </span>
        <button
          onClick={onClose}
          style={{
            width: 26,
            height: 26,
            background: "#1e1e2a",
            border: "1px solid #2a2a3a",
            borderRadius: 6,
            color: "#aaa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#aaa")
          }
        >
          <X size={13} />
        </button>
      </div>

      {/* ---- Scrollable body ---- */}
      <div
        className="scrollbar-dark"
        style={{ flex: 1, overflowY: "auto", padding: "20px" }}
      >
        {/* Usage bar (only when plan data is available) */}
        {planData && todayLimit > 0 && (
          <PlanUsageBar
            used={todayUsed}
            limit={todayLimit}
            planName={PLAN_DISPLAY_NAMES[planData.plan]}
          />
        )}

        {/* Section: Niche */}
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
          What Niche Content do you want to generate for?
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}
        >
          {FIXED_NICHES.map((niche) => (
            <div
              key={niche.name}
              style={{ position: "relative", display: "inline-block" }}
            >
              {/* "your niche" badge — anchored to userNiche pill always */}
              {niche.name === userNiche && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 6,
                    fontSize: 9,
                    background: "#7c6cd4",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    lineHeight: 1.4,
                    zIndex: 1,
                  }}
                >
                  your niche
                </span>
              )}
              <button
                onClick={() => handleNicheSelect(niche.name)}
                style={
                  selectedNiche === niche.name ? pillSelected : pillBase
                }
              >
                {niche.name}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1e1e2a", marginBottom: 20 }} />

        {/* Section: Focus area (shown only when a niche is selected) */}
        {selectedNiche && (
          <>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
              Which area of{" "}
              <strong style={{ color: "#fff" }}>{selectedNiche}</strong> do you
              want to focus on?
            </p>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
            >
              {currentFocusAreas.slice(0, 4).map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedFocus(area)}
                  style={selectedFocus === area ? pillSelected : pillBase}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* View all link */}
            <button
              onClick={() => setShowAllFocus(true)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginBottom: 24,
                fontSize: 12,
                color: "#9d8ee8",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                display: "block",
              }}
            >
              View all ({currentFocusAreas.length})
            </button>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #1e1e2a", marginBottom: 20 }} />
          </>
        )}

        {/* Section: Post count */}
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
          How many posts?
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={decrement}
            disabled={slideCount <= MIN_SLIDES}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#1e1e2a",
              border: "1px solid #2e2e3e",
              color: "#ccc",
              fontSize: 16,
              cursor: slideCount <= MIN_SLIDES ? "not-allowed" : "pointer",
              opacity: slideCount <= MIN_SLIDES ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Minus size={12} />
          </button>

          <span
            style={{
              minWidth: 32,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {slideCount}
          </span>

          <button
            onClick={increment}
            disabled={slideCount >= MAX_SLIDES}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#1e1e2a",
              border: "1px solid #2e2e3e",
              color: "#ccc",
              fontSize: 16,
              cursor: slideCount >= MAX_SLIDES ? "not-allowed" : "pointer",
              opacity: slideCount >= MAX_SLIDES ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Plus size={12} />
          </button>

          <span style={{ fontSize: 13, color: "#555" }}>posts</span>
        </div>

        {/* Preset pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {PRESET_SLIDES.map((preset) => (
            <button
              key={preset}
              onClick={() => setSlideCount(preset)}
              style={slideCount === preset ? pillSelected : pillBase}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1e1e2a", marginBottom: 20 }} />

        {/* Date picker (only when plan data is available) */}
        {planData && (
          <ScheduleDatePicker
            scheduleDaysAhead={planData.scheduleDaysAhead}
            postsPerDay={planData.postsPerDay}
            planName={PLAN_DISPLAY_NAMES[planData.plan]}
            onDateSelect={onDateSelect}
            usageByDate={usageByDate}
            selectedDate={selectedScheduleDate}
          />
        )}

        {/* Inline generation error */}
        {generationError && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 4,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <AlertTriangle
              size={14}
              color="#f59e0b"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <span style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
              {generationError}
            </span>
          </div>
        )}
      </div>

      {/* ---- Footer ---- */}
      <div
        style={{
          borderTop: "1px solid #1e1e2a",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#555",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedNiche && selectedFocus
            ? `${selectedNiche} · ${selectedFocus} · ${slideCount} posts · ${selectedScheduleDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
            : "Select a niche to get started"}
        </span>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            background: canGenerate
              ? "linear-gradient(135deg, #7c6cd4, #9d5fc0)"
              : "#2a2a3a",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: canGenerate ? "pointer" : "not-allowed",
            opacity: canGenerate ? 1 : 0.4,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {isGenerating ? "Generating…" : "Generate →"}
        </button>
      </div>

      {/* ---- Focus area full-panel overlay ---- */}
      <AnimatePresence>
        {showAllFocus && (
          <motion.div
            key="focus-overlay"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#13131a",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              zIndex: 10,
            }}
          >
            {/* Overlay header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 20px",
                borderBottom: "1px solid #1e1e2a",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setShowAllFocus(false)}
                style={{
                  width: 26,
                  height: 26,
                  background: "#1e1e2a",
                  border: "1px solid #2a2a3a",
                  borderRadius: 6,
                  color: "#aaa",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = "#aaa")
                }
              >
                <ChevronLeft size={14} />
              </button>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "#fff",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {selectedNiche}
                </p>
                <p style={{ fontSize: 11, color: "#555", margin: 0 }}>
                  {currentFocusAreas.length} focus areas
                </p>
              </div>
            </div>

            {/* Overlay scrollable list */}
            <div
              className="scrollbar-dark"
              style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {currentFocusAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      setSelectedFocus(area);
                      setShowAllFocus(false);
                    }}
                    style={{
                      background: selectedFocus === area ? "#2d2650" : "#1e1e2a",
                      border: `1px solid ${
                        selectedFocus === area ? "#9d8ee8" : "#2e2e3e"
                      }`,
                      color: selectedFocus === area ? "#d6ccff" : "#ccc",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                      transition:
                        "border-color 0.15s, background 0.15s, color 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFocus !== area) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#232333";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#3e3e5e";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFocus !== area) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#1e1e2a";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#2e2e3e";
                      }
                    }}
                  >
                    <span>{area}</span>
                    {selectedFocus === area && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: "#9d8ee8",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                         */
/* ------------------------------------------------------------------ */

export function GeneratePanel({
  isOpen,
  onClose,
  userNiche,
  onGenerate,
  isGenerating,
  targetDate,
}: GeneratePanelProps) {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [usageByDate, setUsageByDate] = useState<Record<string, DateUsage>>({});
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(
    targetDate ?? new Date()
  );

  // Reset selected date when panel opens with a new targetDate
  useEffect(() => {
    if (isOpen) {
      setSelectedScheduleDate(targetDate ?? new Date());
    }
  }, [isOpen, targetDate]);

  // Fetch plan + usage when panel opens
  useEffect(() => {
    if (!isOpen) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: string[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    Promise.allSettled([
      api.getUserPlan(),
      api.getGenerationStatus(dates),
    ]).then(([planRes, statusRes]) => {
      if (planRes.status === "fulfilled") {
        setPlanData(planRes.value);
      }
      if (statusRes.status === "fulfilled") {
        const map: Record<string, DateUsage> = {};
        statusRes.value.dates.forEach((entry) => {
          map[entry.date] = {
            used: entry.used,
            limit: entry.limit,
            withinWindow: entry.withinWindow,
          };
        });
        setUsageByDate(map);
      }
    });
  }, [isOpen]);

  // Optimistic usage increment after a successful generation
  const handleUsageUpdate = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setUsageByDate((prev) => {
      const current = prev[key] ?? {
        used: 0,
        limit: planData?.postsPerDay ?? 99,
        withinWindow: true,
      };
      return {
        ...prev,
        [key]: { ...current, used: current.used + 1 },
      };
    });
  };

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const sharedContent = (
    <PanelContent
      onClose={onClose}
      userNiche={userNiche}
      onGenerate={onGenerate}
      isGenerating={isGenerating}
      planData={planData}
      usageByDate={usageByDate}
      selectedScheduleDate={selectedScheduleDate}
      onDateSelect={setSelectedScheduleDate}
      onUsageUpdate={handleUsageUpdate}
    />
  );

  return (
    <>
      {/* ---- Desktop: slide-over from right ---- */}
      <div className="hidden md:block">
        {/* Backdrop */}
        <motion.div
          key="panel-backdrop-desktop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 59,
          }}
        />
        {/* Panel */}
        <motion.div
          key="panel-desktop"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 420,
            maxWidth: "100vw",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {sharedContent}
          </div>
        </motion.div>
      </div>

      {/* ---- Mobile: centered modal ---- */}
      <div className="md:hidden">
        {/* Backdrop */}
        <motion.div
          key="panel-backdrop-mobile"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 59,
          }}
        />
        {/* Panel */}
        <motion.div
          key="panel-mobile"
          variants={mobileVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              pointerEvents: "auto",
            }}
          >
            {sharedContent}
          </div>
        </motion.div>
      </div>
    </>
  );
}
