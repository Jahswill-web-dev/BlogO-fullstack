"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Post, dayKey } from "@/components/modules/EditScheduleModal";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDays(month: Date, weekNumber: number): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
  const weekStart = new Date(firstSunday);
  weekStart.setDate(firstSunday.getDate() + (weekNumber - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function getWeekNumberForDate(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
  const diffDays = Math.floor(
    (date.getTime() - firstSunday.getTime()) / 86400000
  );
  return Math.floor(diffDays / 7) + 1;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  PanelPostCard                                                       */
/* ------------------------------------------------------------------ */
function PanelPostCard({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const isPosted = post.status === "posted";
  const time = post.scheduledDate ? formatTime(post.scheduledDate) : "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-2 rounded-lg border border-[#1F2933]/60 hover:border-[#1F2933] transition-colors"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            isPosted ? "bg-[#22c55e]" : "bg-[#1D9BF0]"
          )}
        />
        <span className="text-white/50 text-xs font-medium tabular-nums">
          {time}
        </span>
      </div>
      <p className="text-white/75 text-[13px] leading-snug line-clamp-2">
        {post.content}
      </p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CompactPostCard  (used when a day has 8+ posts)                    */
/* ------------------------------------------------------------------ */
function CompactPostCard({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const isPosted = post.status === "posted";
  const time = post.scheduledDate ? formatTime(post.scheduledDate) : "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 rounded-md border border-[#1F2933]/60 hover:border-[#1F2933] transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            isPosted ? "bg-[#22c55e]" : "bg-[#1D9BF0]"
          )}
        />
        <span className="text-white/50 text-xs font-medium tabular-nums flex-shrink-0">
          {time}
        </span>
        <p className="text-white/70 text-[13px] leading-tight line-clamp-1 min-w-0">
          {post.content}
        </p>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CalendarCard                                                        */
/* ------------------------------------------------------------------ */
interface CalendarCardProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function CalendarCard({ posts, onPostClick }: CalendarCardProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dayKey(today), [today]);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeWeek, setActiveWeek] = useState(() =>
    getWeekNumberForDate(new Date())
  );
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  /* ---------- derived data ---------- */
  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach((p) => {
      if (!p.scheduledDate) return;
      const key = dayKey(p.scheduledDate);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [posts]);

  const weekDays = useMemo(
    () => getWeekDays(currentMonth, activeWeek),
    [currentMonth, activeWeek]
  );

  const selectedDayKey = dayKey(selectedDay);
  const selectedDayPosts = postsByDay[selectedDayKey] ?? [];

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const panelDayLabel = selectedDay.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  /* ---------- handlers ---------- */
  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
    setActiveWeek(1);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setMobileSheetOpen(true);
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="bg-[#0B0F19] rounded-xl border border-[#1F2933] overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2933]">
        {/* Month nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-[#1F2933] transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-white font-semibold text-sm min-w-[100px] text-center select-none">
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-[#1F2933] transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Week tabs */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition select-none",
                activeWeek === w
                  ? "bg-[#1F2933] text-white border border-[#2f3336]"
                  : "text-white/40 hover:text-white/80"
              )}
            >
              Week {w}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar body: day grid + side panel ── */}
      <div className="flex min-h-0">

        {/* Day grid */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="min-w-[340px]">

            {/* Day-name header row */}
            <div className="grid grid-cols-7 border-b border-[#1F2933]">
              {DAY_NAMES.map((name) => (
                <div
                  key={name}
                  className="py-2 text-center text-[11px] font-medium text-white/35 select-none"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {weekDays.map((day, idx) => {
                const key = dayKey(day);
                const dayPosts = postsByDay[key] ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDayKey;
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const visibleDots = dayPosts.slice(0, 5);
                const extraCount = dayPosts.length - visibleDots.length;
                const isLastCol = idx === 6;

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "min-h-[72px] p-2 flex flex-col gap-1 text-left transition-colors",
                      "border-b border-[#1F2933]/30",
                      !isLastCol && "border-r border-[#1F2933]/30",
                      isSelected
                        ? "bg-[#0F1419]"
                        : "hover:bg-[#0d1320]/60"
                    )}
                  >
                    {/* Day number */}
                    <div>
                      {isToday ? (
                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-[#1D9BF0] text-white text-xs font-bold leading-none">
                          {day.getDate()}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium leading-none",
                            isCurrentMonth
                              ? isSelected
                                ? "text-white"
                                : "text-white/80"
                              : "text-white/20"
                          )}
                        >
                          {day.getDate()}
                        </span>
                      )}
                    </div>

                    {/* Status dots + overflow badge */}
                    {visibleDots.length > 0 && (
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {visibleDots.map((p, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full inline-block",
                              p.status === "posted"
                                ? "bg-[#22c55e]"
                                : "bg-[#1D9BF0]"
                            )}
                          />
                        ))}
                        {extraCount > 0 && (
                          <span className="text-[9px] text-white/40 leading-none ml-0.5">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Post count label */}
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-white/30 leading-none">
                        {dayPosts.length}{" "}
                        {dayPosts.length === 1 ? "post" : "posts"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Side panel (desktop only) ── */}
        <div className="hidden md:flex w-[220px] flex-shrink-0 border-l border-[#1F2933] flex-col max-h-[280px]">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-[#1F2933] flex-shrink-0">
            <p className="text-white font-semibold text-sm leading-tight">
              {panelDayLabel}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {selectedDayPosts.length === 0
                ? "No posts"
                : `${selectedDayPosts.length} post${
                    selectedDayPosts.length !== 1 ? "s" : ""
                  } scheduled`}
            </p>
          </div>

          {/* Scrollable post list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {selectedDayPosts.length === 0 ? (
              <p className="text-white/20 text-[11px] text-center pt-6 leading-relaxed">
                No posts for this day.
                <br />
                Click a day to preview.
              </p>
            ) : selectedDayPosts.length >= 8 ? (
              selectedDayPosts.map((post) => (
                <CompactPostCard
                  key={post.id}
                  post={post}
                  onClick={() => onPostClick(post)}
                />
              ))
            ) : (
              selectedDayPosts.map((post) => (
                <PanelPostCard
                  key={post.id}
                  post={post}
                  onClick={() => onPostClick(post)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSheetOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
            />

            {/* Sheet */}
            <motion.div
              key="cal-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19] border-t border-x border-[#1F2933] rounded-t-2xl"
              style={{ maxHeight: "70vh" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 rounded-full bg-[#1F2933]" />
              </div>

              {/* Sheet header */}
              <div className="px-4 pb-3 border-b border-[#1F2933]">
                <p className="text-white font-semibold text-sm">
                  {selectedDay.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {selectedDayPosts.length === 0
                    ? "No posts scheduled"
                    : `${selectedDayPosts.length} post${
                        selectedDayPosts.length !== 1 ? "s" : ""
                      } scheduled`}
                </p>
              </div>

              {/* Post cards */}
              <div
                className="overflow-y-auto p-3 space-y-1"
                style={{ maxHeight: "calc(70vh - 100px)" }}
              >
                {selectedDayPosts.length === 0 ? (
                  <p className="text-white/20 text-xs text-center py-8">
                    No posts for this day.
                  </p>
                ) : selectedDayPosts.length >= 8 ? (
                  selectedDayPosts.map((post) => (
                    <CompactPostCard
                      key={post.id}
                      post={post}
                      onClick={() => {
                        setMobileSheetOpen(false);
                        onPostClick(post);
                      }}
                    />
                  ))
                ) : (
                  selectedDayPosts.map((post) => (
                    <PanelPostCard
                      key={post.id}
                      post={post}
                      onClick={() => {
                        setMobileSheetOpen(false);
                        onPostClick(post);
                      }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
