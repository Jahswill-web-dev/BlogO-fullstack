"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BASE } from "@/lib/api";

interface ConnectXModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectXModal({ isOpen, onClose }: ConnectXModalProps) {
  const handleConnect = () => {
    window.location.href = `${BASE}/auth/x`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="connect-x-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="connect-x-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border p-6 pointer-events-auto"
              style={{ background: "#0B0F19", borderColor: "#1F2933" }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* X logo */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#000" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-white"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-white font-semibold text-base mb-1">
                Connect your X account
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                To post directly to X (Twitter), you need to connect your account
                first. You&apos;ll be redirected to X to authorise access and then
                brought right back.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConnect}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#000" }}
                >
                  Connect X account
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
