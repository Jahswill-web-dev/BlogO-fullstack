"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Repeat2, Heart, Trash2 } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Post } from "@/components/modules/EditScheduleModal";
import { AuthUser } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  TweetCard                                                           */
/* ------------------------------------------------------------------ */
function TweetCard({
  post,
  user,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  post: Post;
  user: AuthUser | null;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate?: (content: string) => void;
}) {
  const initials = user?.name?.[0]?.toUpperCase() ?? "?";
  const handle = user ? "@" + user.email.split("@")[0] : "@user";
  const displayName = user?.name ?? "HackrPost User";

  const [draft, setDraft] = useState(post.content);
  const [focused, setFocused] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize();
  }, []);

  const commitSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== post.content.trim()) {
      onUpdate?.(draft);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative bg-[#0F1419] rounded-xl p-4 cursor-pointer transition-all select-none",
        "border",
        isSelected
          ? "border-[#1D9BF0]"
          : "border-[#1F2933] hover:border-white/20"
      )}
    >
      {/* X logo top-right */}
      <div className="absolute top-3 right-3 text-white/30">
        <FaXTwitter className="w-4 h-4" />
      </div>

      {/* Avatar + identity */}
      <div className="flex items-start gap-3 mb-3 pr-6">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg,#5C3FED,#B44BD6)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {displayName}
          </p>
          <p className="text-white/50 text-xs truncate">{handle}</p>
        </div>
      </div>

      {/* Editable post body */}
      <div className="relative -mx-1 group">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); autoResize(); }}
          onFocus={() => { setFocused(true); autoResize(); }}
          onBlur={() => { setFocused(false); commitSave(); }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full text-white/90 bg-transparent resize-none outline-none rounded-lg px-2 py-1 transition-colors",
            "text-sm leading-relaxed",
            focused
              ? "border border-[#2f3336]"
              : "border border-transparent hover:border-[#1F2933] cursor-text"
          )}
          style={{ overflow: "hidden" }}
        />
        {/* Edit hint */}
        {!focused && !savedFlash && (
          <span className="absolute top-1 right-2 text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
            edit
          </span>
        )}
      </div>

      {/* Saved flash — outside textarea container so it's never hidden behind it */}
      <div className="h-6 flex items-center justify-end mb-1">
        {savedFlash && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/15 text-green-400 border border-green-500/30 select-none">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 text-white/40">
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-[#1D9BF0] transition"
            aria-label="Reply"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-green-400 transition"
            aria-label="Repost"
          >
            <Repeat2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-pink-400 transition"
            aria-label="Like"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-red-400/50 hover:text-red-400 transition"
          aria-label="Remove post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OnboardingPostsModal                                                */
/* ------------------------------------------------------------------ */
interface OnboardingPostsModalProps {
  posts: Post[];
  user: AuthUser | null;
  onClose: () => void;
  onScheduleAll: (posts: Post[]) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}

export function OnboardingPostsModal({
  posts,
  user,
  onClose,
  onScheduleAll,
  onDelete,
  onUpdate,
}: OnboardingPostsModalProps) {
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setLocalPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
    onDelete?.(id);
  };

  const handleUpdate = (id: string, content: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content } : p))
    );
    onUpdate?.(id, content);
  };

  const count = localPosts.length;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ backdropFilter: "blur(3px)", background: "rgba(0,0,0,0.35)" }}
      />

      {/* Positioning container */}
      <div className="fixed inset-0 z-[60] flex items-end md:items-start md:justify-center pointer-events-none md:pt-14">
        {/* Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "pointer-events-auto w-full bg-[#0B0F19] flex flex-col",
            "rounded-t-2xl",
            "md:rounded-2xl md:max-w-[480px] md:w-full md:mx-4",
            "max-h-[90vh] md:max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#1F2933] flex items-start justify-between gap-3 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-lg leading-tight">
                Your posts are ready
              </h2>
              <p className="text-white/50 text-sm mt-1 leading-snug">
                {count} posts generated — tap to edit, then schedule
              </p>
            </div>
            <span className="flex-shrink-0 mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600/20 text-green-400 border border-green-600/30 whitespace-nowrap">
              {count} posts
            </span>
          </div>

          {/* Scrollable tweet list */}
          <div className="scrollbar-dark overflow-y-auto flex-1 px-5 py-4 space-y-3 min-h-0">
            {count === 0 ? (
              <p className="text-white/30 text-sm text-center py-10">
                No posts remaining.
              </p>
            ) : (
              localPosts.map((post) => (
                <TweetCard
                  key={post.id}
                  post={post}
                  user={user}
                  isSelected={selectedId === post.id}
                  onSelect={() => setSelectedId(post.id)}
                  onDelete={() => handleDelete(post.id)}
                  onUpdate={(content) => handleUpdate(post.id, content)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[#1F2933] flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-[#1F2933] text-white text-sm font-medium hover:bg-[#263241] transition"
            >
              Review later
            </button>
            <button
              onClick={() => onScheduleAll(localPosts)}
              disabled={count === 0}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition",
                "bg-[#1D9BF0] hover:bg-[#1a8fd1]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              Schedule all posts →
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
