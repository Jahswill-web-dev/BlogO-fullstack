"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { UpgradePrompt } from "./UpgradePrompt";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Next-tier upgrade info keyed by current plan display name
const NEXT_TIER: Record<
  string,
  { scheduleDays: number; postsPerDay: number } | null
> = {
  Creator: { scheduleDays: 7, postsPerDay: 7 },
  Builder: { scheduleDays: 14, postsPerDay: 12 },
  Authority: null,
};

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface DateUsage {
  used: number;
  limit: number;
  withinWindow: boolean;
}

interface ScheduleDatePickerProps {
  scheduleDaysAhead: number;
  postsPerDay: number;
  planName: string; // "Creator" | "Builder" | "Authority"
  onDateSelect: (date: Date) => void;
  usageByDate: Record<string, DateUsage>;
  selectedDate: Date;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ScheduleDatePicker({
  scheduleDaysAhead,
  planName,
  onDateSelect,
  usageByDate,
  selectedDate,
}: ScheduleDatePickerProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Always render 14 dates so out-of-window dates are visible as an upgrade teaser
  const dates: Date[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(today);
  const nextTier = NEXT_TIER[planName] ?? null;

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 10 }}>
        Schedule for
      </p>

      {/* Horizontal scrollable strip */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 4,
        }}
        className="scrollbar-dark"
      >
        {dates.map((date, idx) => {
          const key = toDateKey(date);
          const usage = usageByDate[key];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          // withinWindow: prefer API data, fall back to index-based check
          const withinWindow =
            usage != null
              ? usage.withinWindow
              : idx < scheduleDaysAhead;

          const isFull = usage != null && usage.used >= usage.limit;
          const isPartial =
            usage != null && usage.used > 0 && usage.used < usage.limit;

          /* ---- Pill style ---- */
          const pillStyle: React.CSSProperties = {
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "6px 10px",
            borderRadius: 999,
            border: `1px solid ${isSelected && withinWindow ? "#9d8ee8" : "#2e2e3e"}`,
            background: isSelected && withinWindow ? "#2d2650" : "#1e1e2a",
            cursor: withinWindow && !isFull ? "pointer" : "not-allowed",
            minWidth: 44,
            position: "relative",
            opacity: withinWindow ? 1 : 0.4,
            transition: "border-color 0.15s, background 0.15s",
          };

          const dayLabelColor =
            isSelected && withinWindow ? "#9d8ee8" : "#6b7280";
          const dateLabelColor =
            isSelected && withinWindow
              ? "#d6ccff"
              : withinWindow
              ? "#ccc"
              : "#555";

          return (
            <button
              key={key}
              title={
                !withinWindow
                  ? "Upgrade to schedule further ahead"
                  : isFull
                  ? "Daily limit reached for this date"
                  : undefined
              }
              onClick={() => {
                if (!withinWindow) {
                  setShowUpgrade(true);
                  return;
                }
                if (isFull) return;
                setShowUpgrade(false);
                onDateSelect(date);
              }}
              style={pillStyle}
            >
              {/* Partial usage dot */}
              {isPartial && withinWindow && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 5,
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: "#9d8ee8",
                  }}
                />
              )}

              {/* Day name */}
              <span
                style={{
                  fontSize: 10,
                  color: dayLabelColor,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                {isToday ? "Today" : DAY_NAMES[date.getDay()]}
              </span>

              {/* Date number or lock icon */}
              {isFull && withinWindow ? (
                <Lock size={11} color="#555" />
              ) : (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: dateLabelColor,
                    lineHeight: 1,
                  }}
                >
                  {date.getDate()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline upgrade prompt */}
      {showUpgrade && nextTier && (
        <div style={{ marginTop: 10 }}>
          <UpgradePrompt
            planName={planName}
            nextScheduleDays={nextTier.scheduleDays}
            nextPostsPerDay={nextTier.postsPerDay}
          />
        </div>
      )}
    </div>
  );
}
