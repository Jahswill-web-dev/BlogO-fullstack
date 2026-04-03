"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Post } from "@/components/modules/EditScheduleModal";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const CAL_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** All day cells (including overflow from adjacent months) for a full-month grid */
function getMonthCells(month: Date): Date[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lastDay = new Date(year, m + 1, 0);
  // pad start to Sunday
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  // pad end to Saturday
  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const cells: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatPreviewTime(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day} · ${time}`;
}

function formatEndDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface AutoSchedulePopoverProps {
  posts: Post[];
  onClose: () => void;
  onConfirm: (scheduledPosts: Post[]) => void;
  isMobileSheet?: boolean;
}

/* ------------------------------------------------------------------ */
/*  AutoSchedulePopover                                                 */
/* ------------------------------------------------------------------ */
export function AutoSchedulePopover({
  posts,
  onClose,
  onConfirm,
  isMobileSheet = false,
}: AutoSchedulePopoverProps) {
  const today = useMemo(() => new Date(), []);

  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [calMonth, setCalMonth] = useState<Date>(() => new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [frequencyHours, setFrequencyHours] = useState(3);

  /* ---------- derived ---------- */
  const unscheduledPosts = useMemo(
    () => posts.filter((p) => p.status === "draft"),
    [posts]
  );

  const scheduledPreviews = useMemo(() => {
    const [h, m] = startTime.split(":").map(Number);
    const base = new Date(selectedDay);
    base.setHours(h, m, 0, 0);
    return unscheduledPosts.map((post, i) => ({
      post,
      date: new Date(base.getTime() + i * frequencyHours * 3_600_000),
    }));
  }, [unscheduledPosts, selectedDay, startTime, frequencyHours]);

  const spanDays = useMemo(() => {
    if (unscheduledPosts.length <= 1) return 0;
    return Math.ceil(((unscheduledPosts.length - 1) * frequencyHours) / 24);
  }, [unscheduledPosts.length, frequencyHours]);

  const endDate = useMemo(() => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + spanDays);
    return d;
  }, [selectedDay, spanDays]);

  const calCells = useMemo(() => getMonthCells(calMonth), [calMonth]);

  const monthLabel = calMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  /* ---------- handlers ---------- */
  const navigateCal = (dir: -1 | 1) => {
    const d = new Date(calMonth);
    d.setMonth(d.getMonth() + dir);
    setCalMonth(d);
  };

  const handleConfirm = () => {
    onConfirm(
      scheduledPreviews.map(({ post, date }) => ({
        ...post,
        scheduledDate: date,
        status: "scheduled" as const,
      }))
    );
  };

  /* ---------- cell styling helper ---------- */
  const getCellStyle = (cell: Date) => {
    const isSelected = isSameDay(cell, selectedDay);
    const isEnd = spanDays > 0 && isSameDay(cell, endDate);
    const isInRange =
      spanDays > 0 &&
      cell > selectedDay &&
      cell < endDate;
    const isToday = isSameDay(cell, today);
    const isCurrentMonth = cell.getMonth() === calMonth.getMonth();

    if (isSelected && isEnd) {
      return {
        bg: "#1D9BF0",
        text: "white",
        radius: "4px",
        opacity: 1,
      };
    }
    if (isSelected) {
      return {
        bg: "#1D9BF0",
        text: "white",
        radius: spanDays > 0 ? "4px 0 0 4px" : "4px",
        opacity: 1,
      };
    }
    if (isEnd) {
      return {
        bg: "#1D9BF0",
        text: "white",
        radius: "0 4px 4px 0",
        opacity: 1,
      };
    }
    if (isInRange) {
      return {
        bg: "rgba(29,155,240,0.15)",
        text: "#93C5FD",
        radius: "0",
        opacity: 1,
      };
    }
    if (isToday) {
      return {
        bg: "rgba(29,155,240,0.25)",
        text: "#93C5FD",
        radius: "4px",
        opacity: 1,
      };
    }
    return {
      bg: "transparent",
      text: isCurrentMonth ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
      radius: "4px",
      opacity: 1,
    };
  };

  /* ---------------------------------------------------------------- */
  return (
    <div
      className={cn(
        "flex flex-col",
        isMobileSheet ? "w-full" : "w-[292px]"
      )}
      style={
        isMobileSheet
          ? {}
          : {
              background: "#0F1419",
              border: "0.5px solid #1F2933",
              borderRadius: 14,
              overflow: "hidden",
            }
      }
    >
      {/* ── Header ── */}
      <div
        className="flex items-start justify-between px-[14px] py-[12px]"
        style={{ borderBottom: "0.5px solid #2f3336" }}
      >
        <div>
          <p className="text-[13px] font-medium text-white leading-tight">
            Auto-schedule posts
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">
            {unscheduledPosts.length} unscheduled post
            {unscheduledPosts.length !== 1 ? "s" : ""} to distribute
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0"
          style={{
            width: 22,
            height: 22,
            background: "#1F2933",
            border: "0.5px solid #2f3336",
            borderRadius: 4,
            fontSize: 11,
            marginTop: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* ── Body ── */}
      <div
        className={cn(
          "flex flex-col overflow-y-auto scrollbar-popup",
          isMobileSheet ? "flex-1" : ""
        )}
        style={{ gap: 11, padding: "12px 14px" }}
      >
        {/* Section 1 — Start date (mini calendar) */}
        <div>
          <p className="text-[11px] text-white/40 mb-1.5">Start date</p>
          <div
            className="overflow-hidden"
            style={{ border: "0.5px solid #2f3336", borderRadius: 8 }}
          >
            {/* Cal header */}
            <div
              className="flex items-center justify-between px-[9px] py-[6px]"
              style={{
                background: "#1F2933",
                borderBottom: "0.5px solid #2f3336",
              }}
            >
              <button
                onClick={() => navigateCal(-1)}
                className="flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{
                  width: 18,
                  height: 18,
                  background: "#0F1419",
                  border: "0.5px solid #2f3336",
                  borderRadius: 4,
                }}
              >
                <ChevronLeft className="w-2.5 h-2.5" />
              </button>
              <span className="text-[11px] font-medium text-white select-none">
                {monthLabel}
              </span>
              <button
                onClick={() => navigateCal(1)}
                className="flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{
                  width: 18,
                  height: 18,
                  background: "#0F1419",
                  border: "0.5px solid #2f3336",
                  borderRadius: 4,
                }}
              >
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Day header */}
            <div
              className="grid grid-cols-7 px-[5px] pt-[5px]"
              style={{ gap: 2 }}
            >
              {CAL_DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center select-none"
                  style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              className="grid grid-cols-7 px-[5px] pb-[5px]"
              style={{ gap: 2 }}
            >
              {calCells.map((cell, idx) => {
                const s = getCellStyle(cell);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(new Date(cell))}
                    className="flex items-center justify-center select-none transition-colors hover:brightness-110"
                    style={{
                      aspectRatio: "1",
                      fontSize: 10,
                      background: s.bg,
                      color: s.text,
                      borderRadius: s.radius,
                      opacity: s.opacity,
                    }}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2 — Start time + Frequency */}
        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          {/* Start time */}
          <div>
            <p className="text-[11px] text-white/40 mb-1.5">Start time</p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-white outline-none focus:ring-0 transition-colors"
              style={{
                fontSize: 12,
                background: "#1F2933",
                border: "0.5px solid #2f3336",
                borderRadius: 8,
                padding: "7px 9px",
                colorScheme: "dark",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#1D9BF0")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#2f3336")
              }
            />
          </div>

          {/* Frequency */}
          <div>
            <p className="text-[11px] text-white/40 mb-1.5">Frequency</p>
            <select
              value={frequencyHours}
              onChange={(e) => setFrequencyHours(Number(e.target.value))}
              className="w-full text-white outline-none appearance-none cursor-pointer"
              style={{
                fontSize: 12,
                background: "#1F2933",
                border: "0.5px solid #2f3336",
                borderRadius: 8,
                padding: "7px 9px",
                colorScheme: "dark",
              }}
            >
              <option value={1}>Every 1 hr</option>
              <option value={2}>Every 2 hrs</option>
              <option value={3}>Every 3 hrs</option>
              <option value={5}>Every 5 hrs</option>
              <option value={12}>Twice daily</option>
              <option value={24}>Once daily</option>
            </select>
          </div>
        </div>

        {/* Section 3 — Post schedule preview */}
        <div>
          <p className="text-[11px] text-white/40 mb-1.5">
            Post schedule preview
          </p>
          {unscheduledPosts.length === 0 ? (
            <p className="text-[11px] text-white/20 text-center py-4">
              No draft posts to schedule.
            </p>
          ) : (
            <div
              className="flex flex-col overflow-y-auto scrollbar-popup"
              style={{ gap: 4, maxHeight: 140 }}
            >
              {scheduledPreviews.map(({ post, date }, i) => (
                <div
                  key={post.id}
                  className="flex items-center"
                  style={{
                    gap: 8,
                    border: "0.5px solid #2f3336",
                    borderRadius: 8,
                    background: "#1F2933",
                    padding: "6px 9px",
                  }}
                >
                  <span
                    className="text-white/40 font-medium tabular-nums flex-shrink-0"
                    style={{ fontSize: 10, minWidth: 12 }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-white/70 truncate flex-1"
                    style={{ fontSize: 11 }}
                  >
                    {post.content}
                  </span>
                  <span
                    className="font-medium flex-shrink-0 tabular-nums"
                    style={{ fontSize: 10, color: "#1D9BF0" }}
                  >
                    {formatPreviewTime(date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4 — Info box */}
        <div
          className="flex items-start gap-2"
          style={{
            background: "rgba(29,155,240,0.07)",
            border: "0.5px solid rgba(29,155,240,0.2)",
            borderRadius: 8,
            padding: "9px 11px",
          }}
        >
          <Info
            size={13}
            className="flex-shrink-0 mt-[1px]"
            style={{ color: "#93C5FD" }}
          />
          <p
            className="leading-[1.45]"
            style={{ fontSize: 12, color: "#93C5FD" }}
          >
            {spanDays === 0 ? (
              <>
                All posts will be scheduled on{" "}
                <strong style={{ fontWeight: 500 }}>
                  {selectedDay.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
                .
              </>
            ) : (
              <>
                Posting will span{" "}
                <strong style={{ fontWeight: 500 }}>{spanDays} day{spanDays !== 1 ? "s" : ""}</strong>{" "}
                and end on{" "}
                <strong style={{ fontWeight: 500 }}>
                  {formatEndDate(endDate)}
                </strong>
                .
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          padding: "10px 14px",
          gap: 7,
          borderTop: "0.5px solid #2f3336",
        }}
      >
        <button
          onClick={onClose}
          className="text-white hover:opacity-80 transition-opacity"
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: "#1F2933",
            border: "1px solid #2f3336",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={unscheduledPosts.length === 0}
          className="text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            flex: 1.4,
            padding: "8px 0",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: "#1D9BF0",
            border: "none",
          }}
        >
          Confirm schedule →
        </button>
      </div>
    </div>
  );
}
