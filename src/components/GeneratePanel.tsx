"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { FIXED_NICHES } from "@/lib/niches";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface GeneratePanelProps {
  isOpen: boolean;
  onClose: () => void;
  userNiche: string;
  isGenerating?: boolean;
  onGenerate: (params: {
    niche: string;
    focusArea: string;
    slideCount: number;
  }) => void;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

const mobileVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const MIN_SLIDES = 3;
const MAX_SLIDES = 15;
const PRESET_SLIDES = [5, 7, 10];

/* ------------------------------------------------------------------ */
/*  Shared pill styles                                                  */
/* ------------------------------------------------------------------ */

const pillBase: React.CSSProperties = {
  background: "#1e1e2a",
  border: "1px solid #2e2e3e",
  color: "#ccc",
  borderRadius: 999,
  padding: "7px 14px",
  fontSize: 13,
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s, color 0.15s",
  whiteSpace: "nowrap" as const,
};

const pillSelected: React.CSSProperties = {
  ...pillBase,
  border: "1px solid #9d8ee8",
  background: "#2d2650",
  color: "#d6ccff",
};

/* ------------------------------------------------------------------ */
/*  Inner panel content (shared between desktop & mobile)              */
/* ------------------------------------------------------------------ */

function PanelContent({
  onClose,
  userNiche,
  onGenerate,
  isGenerating,
}: {
  onClose: () => void;
  userNiche: string;
  isGenerating?: boolean;
  onGenerate: GeneratePanelProps["onGenerate"];
}) {
  const [selectedNiche, setSelectedNiche] = useState(userNiche);
  const [selectedFocus, setSelectedFocus] = useState(() => {
    const niche = FIXED_NICHES.find((n) => n.name === userNiche);
    return niche?.focusAreas[0] ?? "";
  });
  const [slideCount, setSlideCount] = useState(7);

  // Re-initialise whenever the panel (re-)opens with a potentially different userNiche
  useEffect(() => {
    setSelectedNiche(userNiche);
    const niche = FIXED_NICHES.find((n) => n.name === userNiche);
    setSelectedFocus(niche?.focusAreas[0] ?? "");
    setSlideCount(7);
  }, [userNiche]);

  const handleNicheSelect = (nicheName: string) => {
    setSelectedNiche(nicheName);
    const niche = FIXED_NICHES.find((n) => n.name === nicheName);
    setSelectedFocus(niche?.focusAreas[0] ?? "");
  };

  const decrement = () => setSlideCount((c) => Math.max(MIN_SLIDES, c - 1));
  const increment = () => setSlideCount((c) => Math.min(MAX_SLIDES, c + 1));

  const currentFocusAreas =
    FIXED_NICHES.find((n) => n.name === selectedNiche)?.focusAreas ?? [];

  const canGenerate = !!selectedNiche && !!selectedFocus && !isGenerating;

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate({ niche: selectedNiche, focusArea: selectedFocus, slideCount });
  };

  return (
    <div
      style={{
        background: "#13131a",
        border: "1px solid #2a2a3a",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ---- Header ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #1e1e2a",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
          Create carousel post
        </span>
        <button
          onClick={onClose}
          style={{
            width: 26,
            height: 26,
            background: "#1e1e2a",
            border: "1px solid #2a2a3a",
            borderRadius: 6,
            color: "#aaa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#aaa")
          }
        >
          <X size={13} />
        </button>
      </div>

      {/* ---- Scrollable body ---- */}
      <div className="scrollbar-dark" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {/* Section: Niche */}
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
          What Niche Content do you want to generate for?
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}
        >
          {FIXED_NICHES.map((niche) => (
            <div
              key={niche.name}
              style={{ position: "relative", display: "inline-block" }}
            >
              {/* "your niche" badge — anchored to userNiche pill always */}
              {niche.name === userNiche && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 6,
                    fontSize: 9,
                    background: "#7c6cd4",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    lineHeight: 1.4,
                    zIndex: 1,
                  }}
                >
                  your niche
                </span>
              )}
              <button
                onClick={() => handleNicheSelect(niche.name)}
                style={
                  selectedNiche === niche.name ? pillSelected : pillBase
                }
              >
                {niche.name}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1e1e2a", marginBottom: 20 }} />

        {/* Section: Focus area (shown only when a niche is selected) */}
        {selectedNiche && (
          <>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
              Which area of{" "}
              <strong style={{ color: "#fff" }}>{selectedNiche}</strong> do you
              want to focus on?
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {currentFocusAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedFocus(area)}
                  style={selectedFocus === area ? pillSelected : pillBase}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #1e1e2a", marginBottom: 20 }} />
          </>
        )}

        {/* Section: Post count */}
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
          How many posts?
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={decrement}
            disabled={slideCount <= MIN_SLIDES}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#1e1e2a",
              border: "1px solid #2e2e3e",
              color: "#ccc",
              fontSize: 16,
              cursor: slideCount <= MIN_SLIDES ? "not-allowed" : "pointer",
              opacity: slideCount <= MIN_SLIDES ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Minus size={12} />
          </button>

          <span
            style={{
              minWidth: 32,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {slideCount}
          </span>

          <button
            onClick={increment}
            disabled={slideCount >= MAX_SLIDES}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#1e1e2a",
              border: "1px solid #2e2e3e",
              color: "#ccc",
              fontSize: 16,
              cursor: slideCount >= MAX_SLIDES ? "not-allowed" : "pointer",
              opacity: slideCount >= MAX_SLIDES ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Plus size={12} />
          </button>

          <span style={{ fontSize: 13, color: "#555" }}>posts</span>
        </div>

        {/* Preset pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {PRESET_SLIDES.map((preset) => (
            <button
              key={preset}
              onClick={() => setSlideCount(preset)}
              style={slideCount === preset ? pillSelected : pillBase}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Footer ---- */}
      <div
        style={{
          borderTop: "1px solid #1e1e2a",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#555",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedNiche && selectedFocus
            ? `${selectedNiche} · ${selectedFocus} · ${slideCount} posts`
            : "Select a niche to get started"}
        </span>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            background:
              !!selectedNiche && !!selectedFocus && !isGenerating
                ? "linear-gradient(135deg, #7c6cd4, #9d5fc0)"
                : "#2a2a3a",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: canGenerate ? "pointer" : "not-allowed",
            opacity: canGenerate ? 1 : 0.4,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {isGenerating ? "Generating…" : "Generate →"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                         */
/* ------------------------------------------------------------------ */

export function GeneratePanel({
  isOpen,
  onClose,
  userNiche,
  onGenerate,
  isGenerating,
}: GeneratePanelProps) {
  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const sharedContent = (
    <PanelContent
      onClose={onClose}
      userNiche={userNiche}
      onGenerate={onGenerate}
      isGenerating={isGenerating}
    />
  );

  return (
    <>
      {/* ---- Desktop: slide-over from right ---- */}
      <div className="hidden md:block">
        {/* Backdrop */}
        <motion.div
          key="panel-backdrop-desktop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 59,
          }}
        />
        {/* Panel */}
        <motion.div
          key="panel-desktop"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 420,
            maxWidth: "100vw",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{sharedContent}</div>
        </motion.div>
      </div>

      {/* ---- Mobile: centered modal ---- */}
      <div className="md:hidden">
        {/* Backdrop */}
        <motion.div
          key="panel-backdrop-mobile"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 59,
          }}
        />
        {/* Panel */}
        <motion.div
          key="panel-mobile"
          variants={mobileVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              pointerEvents: "auto",
            }}
          >
            {sharedContent}
          </div>
        </motion.div>
      </div>
    </>
  );
}
