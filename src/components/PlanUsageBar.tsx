"use client";

import React from "react";

interface PlanUsageBarProps {
  used: number;
  limit: number;
  planName: string;
}

export function PlanUsageBar({ used, limit, planName }: PlanUsageBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isLimitReached = used >= limit;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "#aaa" }}>Today's posts</span>
        <span
          style={{
            fontSize: 11,
            color: "#d6ccff",
            background: "#2d2650",
            border: "1px solid #9d8ee8",
            borderRadius: 999,
            padding: "2px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {planName} Plan
        </span>
      </div>

      {/* Progress bar track */}
      <div
        style={{
          width: "100%",
          height: 6,
          background: "#2d2650",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: isLimitReached ? "#f59e0b" : "#9d8ee8",
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Status text */}
      {isLimitReached ? (
        <span style={{ fontSize: 11, color: "#f59e0b" }}>
          Limit reached — upgrade to generate more today
        </span>
      ) : (
        <span style={{ fontSize: 11, color: "#6b7280" }}>
          {used} of {limit} posts used today
        </span>
      )}
    </div>
  );
}
