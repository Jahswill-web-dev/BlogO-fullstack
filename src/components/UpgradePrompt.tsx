"use client";

import React from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  planName: string;
  nextScheduleDays: number;
  nextPostsPerDay: number;
}

export function UpgradePrompt({
  planName,
  nextScheduleDays,
  nextPostsPerDay,
}: UpgradePromptProps) {
  return (
    <div
      style={{
        background: "#1a1826",
        border: "1px solid #9d8ee8",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "#2d2650",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Lock size={13} color="#9d8ee8" />
      </div>

      {/* Text + CTA */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: "#d6ccff", margin: "0 0 4px" }}>
          You&apos;re on the <strong>{planName}</strong> plan.
        </p>
        <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 10px" }}>
          Upgrade to schedule up to{" "}
          <strong style={{ color: "#aaa" }}>{nextScheduleDays} days</strong>{" "}
          ahead and generate{" "}
          <strong style={{ color: "#aaa" }}>{nextPostsPerDay} posts/day</strong>.
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #7c6cd4, #9d5fc0)",
            color: "#fff",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
