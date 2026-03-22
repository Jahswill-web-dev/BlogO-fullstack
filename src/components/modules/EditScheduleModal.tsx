"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Trash2,
  Info,
  Archive,
  Check,
} from "lucide-react";
import { GradientButton } from "@/components/ui/buttons/gradientButton";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                   */
/* ------------------------------------------------------------------ */
export type Post = {
  id: string;
  content: string;
  platform: "Twitter";
  status: "draft" | "scheduled" | "posted";
  scheduledDate?: Date;
};

export const FREQUENCIES = [
  { label: "Every 5 minutes",  minutes: 5 },
  { label: "Every 15 minutes", minutes: 15 },
  { label: "Every 30 minutes", minutes: 30 },
  { label: "Every hour",       minutes: 60 },
  { label: "Every 6 hours",    minutes: 360 },
  { label: "Every day",        minutes: 1440 },
];

export const CAL_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
export function timeToHHMM(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ordinalDate(d: Date) {
  return `${ordinal(d.getDate())} ${d.toLocaleString("default", { month: "short" })}`;
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Mini Calendar                                                       */
/* ------------------------------------------------------------------ */
export function MiniCalendar({
  month,
  selected,
  onSelect,
  onMonthChange,
}: {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const today = new Date();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startPad = firstDay.getDay();

  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from(
      { length: lastDay.getDate() },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)
    ),
  ];
  while (cells.length < 42) cells.push(null);

  const monthLabel = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            const d = new Date(month);
            d.setMonth(d.getMonth() - 1);
            onMonthChange(d);
          }}
          className="p-1 text-white/50 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white font-medium text-sm">{monthLabel}</span>
        <button
          onClick={() => {
            const d = new Date(month);
            d.setMonth(d.getMonth() + 1);
            onMonthChange(d);
          }}
          className="p-1 text-white/50 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {CAL_HEADERS.map((h) => (
          <div key={h} className="text-center text-gray-500 text-xs py-1">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isSelected = dayKey(cell) === dayKey(selected);
          const isToday = dayKey(cell) === dayKey(today);
          const inMonth = cell.getMonth() === month.getMonth();
          return (
            <button
              key={i}
              onClick={() => inMonth && onSelect(cell)}
              className={`w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full transition
                ${
                  isSelected
                    ? "bg-[linear-gradient(135deg,#5C3FED,#B44BD6)] text-white font-semibold"
                    : isToday && inMonth
                    ? "text-[#5C3FED] font-semibold hover:bg-white/10"
                    : inMonth
                    ? "text-white hover:bg-white/10 cursor-pointer"
                    : "text-gray-600 cursor-default"
                }`}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit & Schedule Modal                                               */
/* ------------------------------------------------------------------ */
export function EditScheduleModal({
  post,
  dayPosts,
  onClose,
  onSave,
}: {
  post: Post;
  dayPosts: Post[];
  onClose: () => void;
  onSave: (id: string, content: string, date: Date) => void;
}) {
  const [localPosts, setLocalPosts] = useState<Post[]>(dayPosts);
  const [activeId, setActiveId] = useState(post.id);
  const [editContent, setEditContent] = useState(post.content);
  const [modalMonth, setModalMonth] = useState(post.scheduledDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState(post.scheduledDate ?? new Date());
  const [startTime, setStartTime] = useState(
    post.scheduledDate ? timeToHHMM(post.scheduledDate) : "20:00"
  );
  const [frequency, setFrequency] = useState("Every 5 minutes");

  const freqMinutes =
    FREQUENCIES.find((f) => f.label === frequency)?.minutes ?? 5;
  const totalMinutes = (localPosts.length - 1) * freqMinutes;
  const spanDays = Math.max(1, Math.ceil(totalMinutes / 1440));
  const endDate = new Date(selectedDate);
  endDate.setMinutes(endDate.getMinutes() + totalMinutes);

  const handleCardClick = (p: Post) => {
    setActiveId(p.id);
    setEditContent(p.content);
  };

  const handleDelete = (id: string) => {
    const remaining = localPosts.filter((p) => p.id !== id);
    setLocalPosts(remaining);
    if (id === activeId && remaining.length > 0) {
      setActiveId(remaining[0].id);
      setEditContent(remaining[0].content);
    }
  };

  const handleDone = () => {
    const [hh, mm] = startTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hh, mm, 0, 0);
    onSave(activeId, editContent, finalDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1419] flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#2f3336] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold text-base sm:text-lg">
            Edit &amp; Schedule
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
            <Archive className="w-4 h-4" />
            Archive All
          </button>
          <GradientButton
            buttonLabel="Schedule Tweets"
            className="px-4 py-2 text-sm"
            onClick={handleDone}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-64 sm:w-72 flex-shrink-0 border-r border-[#2f3336] overflow-y-auto p-3 sm:p-4 space-y-3">
          {localPosts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              className={`relative p-4 rounded-xl border cursor-pointer transition
                ${
                  activeId === p.id
                    ? "border-[#5C3FED] bg-[#5C3FED]/5"
                    : "border-[#2f3336] hover:border-white/20"
                }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p.id);
                }}
                className="absolute top-2 right-2 text-red-400/60 hover:text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <p className="text-white/80 text-xs leading-snug line-clamp-5 pr-5 whitespace-pre-line">
                {p.content}
              </p>
            </div>
          ))}
        </div>

        {/* Center panel */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent text-white text-base leading-relaxed resize-none outline-none placeholder:text-white/20"
            placeholder="Write your tweet..."
          />
        </div>

        {/* Right panel */}
        <div className="hidden md:flex w-72 lg:w-80 flex-shrink-0 border-l border-[#2f3336] flex-col p-5 overflow-y-auto gap-5">
          <MiniCalendar
            month={modalMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            onMonthChange={setModalMonth}
          />
          <div>
            <label className="block text-white/70 text-xs mb-2">
              Select Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#1F2933] text-white rounded-lg px-4 py-3 text-sm border border-[#2f3336] outline-none focus:border-[#5C3FED] transition appearance-none"
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs mb-2">
              Posting Frequency
            </label>
            <div className="relative">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#1F2933] text-white rounded-lg px-4 py-3 text-sm border border-[#2f3336] outline-none appearance-none cursor-pointer"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.label} value={f.label}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>
          </div>
          <div className="bg-[#0d1a2d] border border-[#1a3050] rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">
              Posting will span{" "}
              <strong className="text-white">
                {spanDays} {spanDays === 1 ? "day" : "days"}
              </strong>{" "}
              and end on{" "}
              <strong className="text-white">{ordinalDate(endDate)}</strong>
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleDone}
              className="flex items-center gap-2 text-white text-sm hover:text-white/70 transition"
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
