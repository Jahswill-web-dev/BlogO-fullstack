"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Post, dayKey } from "@/components/modules/EditScheduleModal";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_ORDER: Record<string, number> = { posted: 0, scheduled: 1, draft: 2 };

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
  const diffDays = Math.floor((date.getTime() - firstSunday.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function PanelPostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const isPosted = post.status === "posted";
  const isDraft = post.status === "draft";
  const time = !isDraft && post.scheduledDate ? formatTime(post.scheduledDate) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-2 rounded-lg border border-[#1F2933]/60 hover:border-[#1F2933] transition-colors"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            isPosted ? "bg-[#22c55e]" : isDraft ? "bg-white/20" : "bg-[#1D9BF0]"
          )}
        />
        <span className="text-white/50 text-xs font-medium tabular-nums">
          {time ?? <span className="italic text-white/30">Draft</span>}
        </span>
      </div>
      <p className="text-white/75 text-[13px] leading-snug line-clamp-2">
        {post.content}
      </p>
    </button>
  );
}

function CompactPostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const isPosted = post.status === "posted";
  const isDraft = post.status === "draft";
  const time = !isDraft && post.scheduledDate ? formatTime(post.scheduledDate) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 rounded-md border border-[#1F2933]/60 hover:border-[#1F2933] transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            isPosted ? "bg-[#22c55e]" : isDraft ? "bg-white/20" : "bg-[#1D9BF0]"
          )}
        />
        <span className="text-white/50 text-xs font-medium tabular-nums flex-shrink-0">
          {time ?? <span className="italic text-white/30">Draft</span>}
        </span>
        <p className="text-white/70 text-[13px] leading-tight line-clamp-1 min-w-0">
          {post.content}
        </p>
      </div>
    </button>
  );
}

interface CalendarCardProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onAutoScheduleClick: (posts: Post[], initialDate?: Date) => void;
  onGenerateClick: (day: Date) => void;
  onDayClick: (day: Date, posts: Post[]) => void;
}

export function CalendarCard({
  posts,
  onPostClick,
  onAutoScheduleClick,
  onGenerateClick,
  onDayClick,
}: CalendarCardProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dayKey(today), [today]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeWeek, setActiveWeek] = useState(() => getWeekNumberForDate(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach((post) => {
      const calendarDay = post.targetDate ?? post.scheduledDate;
      if (!calendarDay) return;
      const key = dayKey(calendarDay);
      if (!map[key]) map[key] = [];
      map[key].push(post);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2))
    );
    return map;
  }, [posts]);

  const weekDays = useMemo(() => getWeekDays(currentMonth, activeWeek), [currentMonth, activeWeek]);
  const selectedDayKey = dayKey(selectedDay);
  const selectedDayPosts = postsByDay[selectedDayKey] ?? [];
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const panelDayLabel = selectedDay.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
    setActiveWeek(1);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    const key = dayKey(day);
    onDayClick(day, postsByDay[key] ?? []);
  };

  return (
    <div className="relative bg-[#0B0F19] rounded-xl border border-[#1F2933]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2933]">
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

        <div className="flex items-center gap-2">
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
                <span className="sm:hidden">W{w}</span>
                <span className="hidden sm:inline">Week {w}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => onAutoScheduleClick(posts)}
            className="flex items-center gap-1.5 text-white hover:opacity-90 transition-opacity px-[7px] sm:px-[11px] py-[5px] rounded-[8px] text-[12px] font-medium"
            style={{ background: "#1D9BF0" }}
          >
            <CalendarDays className="w-3 h-3" />
            <span className="hidden sm:inline">Auto-schedule</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="min-w-[340px]">
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

            <div className="grid grid-cols-7">
              {weekDays.map((day, idx) => {
                const key = dayKey(day);
                const dayPosts = postsByDay[key] ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDayKey;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
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
                      isSelected ? "bg-[#0F1419]" : "hover:bg-[#0d1320]/60"
                    )}
                  >
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

                    {visibleDots.length > 0 && (
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {visibleDots.map((post, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full inline-block",
                              post.status === "posted" ? "bg-[#22c55e]" : "bg-[#1D9BF0]"
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

                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-white/30 leading-none">
                        {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-[220px] flex-shrink-0 border-l border-[#1F2933] flex-col max-h-[280px]">
          <div className="px-4 py-3 border-b border-[#1F2933] flex-shrink-0">
            <p className="text-white font-semibold text-sm leading-tight">{panelDayLabel}</p>
            <p className="text-white/40 text-xs mt-0.5">
              {selectedDayPosts.length === 0
                ? "No posts"
                : `${selectedDayPosts.length} post${selectedDayPosts.length !== 1 ? "s" : ""} scheduled`}
            </p>
          </div>

          <div className="scrollbar-calendar flex-1 overflow-y-auto p-3 space-y-1">
            {selectedDayPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-3 gap-3">
                <p className="text-white/20 text-[11px] text-center leading-relaxed">
                  No posts for this day.
                </p>
                <button
                  onClick={() => onGenerateClick(selectedDay)}
                  className="flex items-center gap-1.5 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: "#5C3FED" }}
                >
                  <Sparkles className="w-3 h-3" />
                  Generate posts
                </button>
              </div>
            ) : selectedDayPosts.length >= 8 ? (
              selectedDayPosts.map((post) => (
                <CompactPostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
              ))
            ) : (
              selectedDayPosts.map((post) => (
                <PanelPostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
