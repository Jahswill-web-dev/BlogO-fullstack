"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, PenLine, X } from "lucide-react";

interface WritePostModalProps {
  isOpen: boolean;
  isWriting?: boolean;
  onClose: () => void;
  onImprove: (input: string) => Promise<void>;
}

export function WritePostModal({
  isOpen,
  isWriting,
  onClose,
  onImprove,
}: WritePostModalProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isWriting) onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isWriting, onClose]);

  if (!isOpen) return null;

  const trimmedInput = input.trim();
  const canImprove = trimmedInput.length > 0 && !isWriting;

  const handleImprove = async () => {
    if (!canImprove) return;
    setError(null);
    try {
      await onImprove(trimmedInput);
      setInput("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to improve this post.";
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isWriting) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-[520px] overflow-hidden rounded-xl border"
        style={{ background: "#13131a", borderColor: "#2a2a3a" }}
      >
        <div
          className="flex items-center justify-between gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid #1e1e2a" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: "#1e1e2a", border: "1px solid #2e2e3e" }}
            >
              <PenLine className="h-4 w-4 text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Write</p>
              <p className="mt-0.5 text-xs text-white/40">
                Paste an idea, focus area, or draft.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isWriting}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "#1e1e2a", border: "1px solid #2a2a3a" }}
            aria-label="Close write modal"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-5">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isWriting}
            autoFocus
            className="min-h-[190px] w-full resize-none rounded-lg border bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#9d8ee8] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "#2e2e3e", background: "#0f0f16" }}
            placeholder="Write the idea you want to turn into a post..."
          />

          {error && (
            <div
              className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <AlertTriangle
                size={14}
                color="#f59e0b"
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs leading-5 text-[#fbbf24]">{error}</span>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderTop: "1px solid #1e1e2a" }}
        >
          <span className="min-w-0 truncate text-xs text-white/35">
            {trimmedInput
              ? `${trimmedInput.length} characters`
              : "Your post will be saved as a draft"}
          </span>
          <button
            onClick={handleImprove}
            disabled={!canImprove}
            className="flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: canImprove
                ? "linear-gradient(135deg, #7c6cd4, #9d5fc0)"
                : "#2a2a3a",
            }}
          >
            <PenLine size={14} />
            {isWriting ? "Improving..." : "Improve"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
