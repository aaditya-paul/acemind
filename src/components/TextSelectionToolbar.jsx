"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Copy, MessageCircle, Check } from "lucide-react";

const TextSelectionToolbar = ({ onAskDoubt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [copied, setCopied] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Toolbar dimensions
        const toolbarWidth = 250;
        const toolbarHeight = 60;
        const margin = 10;

        // Calculate position with viewport constraints
        let x = rect.left + rect.width / 2;
        let y = rect.top - margin;
        let positionBelow = false;

        // Keep toolbar within viewport horizontally
        if (x - toolbarWidth / 2 < margin) {
          x = toolbarWidth / 2 + margin;
        } else if (x + toolbarWidth / 2 > window.innerWidth - margin) {
          x = window.innerWidth - toolbarWidth / 2 - margin;
        }

        // Keep toolbar within viewport vertically
        if (y - toolbarHeight < margin) {
          // Not enough space above, position below selection
          y = rect.bottom + margin;
          positionBelow = true;
        }

        // Check if positioning below would go out of viewport
        if (positionBelow && y + toolbarHeight > window.innerHeight - margin) {
          // Position at the best available spot
          y = window.innerHeight - toolbarHeight - margin;
        }

        setPosition({ x, y, positionBelow });
        setSelectedText(text);
        setIsVisible(true);
        setCopied(false);
      } else {
        setIsVisible(false);
        setSelectedText("");
      }
    };

    // Add event listeners
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    // Handle click outside to hide toolbar
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection?.toString().trim()) {
          setIsVisible(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleAskDoubt = () => {
    if (onAskDoubt) {
      onAskDoubt(selectedText);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[100] pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: position.positionBelow
            ? "translate(-50%, 0%)"
            : "translate(-50%, -100%)",
        }}
      >
        <div className="bg-gray-900 border border-gray-700/50 rounded-lg shadow-2xl p-1 flex items-center gap-1 backdrop-blur-lg">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors flex items-center gap-2 text-sm text-gray-300 hover:text-white group"
            title="Copy text"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-700/50" />

          {/* Ask Doubt Button */}
          <button
            onClick={handleAskDoubt}
            className="px-3 py-2 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 rounded-md transition-all flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 group"
            title="Ask about this text"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Doubt</span>
          </button>
        </div>

        {/* Arrow pointing to selection */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 ${
            position.positionBelow
              ? "-top-1 border-l border-t rotate-45"
              : "-bottom-1 border-r border-b rotate-45"
          } border-gray-700/50`}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default TextSelectionToolbar;
