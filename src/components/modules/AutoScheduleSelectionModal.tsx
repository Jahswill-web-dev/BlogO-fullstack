"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Post, dayKey } from "@/components/modules/EditScheduleModal";
import { cn } from "@/lib/utils";

interface AutoScheduleSelectionModalProps {
  posts: Post[];
  isOpen: boolean;
  onClose: () => void;
  onContinue: (posts: Post[]) => void;
}

function getGeneratedDate(post: Post): Date | null {
  return post.targetDate ?? null;
}

function formatGroupLabel(date: Date | null): string {
  if (!date) return "Unassigned date";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getEligibleDrafts(posts: Post[]) {
  return posts
    .filter((post) => post.status === "draft" && !post.scheduledPostId)
    .sort((a, b) => {
      const aDate = getGeneratedDate(a);
      const bDate = getGeneratedDate(b);
      const aTime = aDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = bDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;
      return a.id.localeCompare(b.id);
    });
}

function StatusPill() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
      Draft
    </span>
  );
}

export function AutoScheduleSelectionModal({
  posts,
  isOpen,
  onClose,
  onContinue,
}: AutoScheduleSelectionModalProps) {
  const eligiblePosts = useMemo(() => getEligibleDrafts(posts), [posts]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(eligiblePosts.map((post) => post.id))
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(new Set(eligiblePosts.map((post) => post.id)));
  }, [eligiblePosts, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const groupedPosts = useMemo(() => {
    const groups: Array<{ key: string; label: string; posts: Post[] }> = [];
    for (const post of eligiblePosts) {
      const generatedDate = getGeneratedDate(post);
      const key = generatedDate ? dayKey(generatedDate) : "unassigned";
      let group = groups.find((item) => item.key === key);
      if (!group) {
        group = { key, label: formatGroupLabel(generatedDate), posts: [] };
        groups.push(group);
      }
      group.posts.push(post);
    }
    return groups;
  }, [eligiblePosts]);

  const selectedPosts = useMemo(
    () => eligiblePosts.filter((post) => selectedIds.has(post.id)),
    [eligiblePosts, selectedIds]
  );

  if (!isOpen) return null;

  const togglePost = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="w-full max-w-[760px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#0F1419",
          border: "0.5px solid #1F2933",
          maxHeight: "86vh",
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "0.5px solid #1F2933" }}
        >
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              Select drafts to auto-schedule
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {selectedPosts.length} of {eligiblePosts.length} draft
              {eligiblePosts.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0 ml-3"
            style={{
              width: 28,
              height: 28,
              background: "#1F2933",
              border: "0.5px solid #2f3336",
              borderRadius: 6,
            }}
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className="flex items-center justify-between px-4 py-2 flex-shrink-0"
          style={{ borderBottom: "0.5px solid #1F2933" }}
        >
          <span className="text-white/35 text-[11px]">
            Grouped by generated calendar date
          </span>
          {eligiblePosts.length > 0 && (
            <button
              onClick={() =>
                setSelectedIds(
                  selectedPosts.length === eligiblePosts.length
                    ? new Set()
                    : new Set(eligiblePosts.map((post) => post.id))
                )
              }
              className="text-[11px] font-medium transition-opacity hover:opacity-80"
              style={{ color: "#1D9BF0" }}
            >
              {selectedPosts.length === eligiblePosts.length ? "Clear all" : "Select all"}
            </button>
          )}
        </div>

        <div className="overflow-y-auto scrollbar-popup flex-1 p-4 space-y-4">
          {eligiblePosts.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <p className="text-white/25 text-sm text-center">
                No unscheduled drafts available.
              </p>
            </div>
          ) : (
            groupedPosts.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs font-semibold">
                    {group.label}
                  </p>
                  <p className="text-white/25 text-[11px]">
                    {group.posts.length} post{group.posts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {group.posts.map((post) => {
                    const selected = selectedIds.has(post.id);
                    return (
                      <button
                        key={post.id}
                        onClick={() => togglePost(post.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-colors group",
                          selected
                            ? "border-[#1D9BF0]"
                            : "border-[#1F2933] hover:border-[#2f3336]"
                        )}
                        style={{
                          background: selected
                            ? "rgba(29,155,240,0.09)"
                            : "#141920",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              border: `1px solid ${
                                selected ? "#1D9BF0" : "rgba(255,255,255,0.25)"
                              }`,
                              background: selected ? "#1D9BF0" : "transparent",
                            }}
                          >
                            {selected && <Check className="w-3.5 h-3.5 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 mb-2">
                              <StatusPill />
                            </span>
                            <span className="block text-white/80 text-[13px] leading-snug line-clamp-3 whitespace-pre-line">
                              {post.content}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 flex-shrink-0"
          style={{ borderTop: "0.5px solid #1F2933" }}
        >
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition-opacity px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#1F2933", border: "1px solid #2f3336" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onContinue(selectedPosts)}
            disabled={selectedPosts.length === 0}
            className="text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#1D9BF0", border: "none" }}
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
