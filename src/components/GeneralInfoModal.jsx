"use client";

import React from "react";
import {motion, AnimatePresence} from "framer-motion";

const GeneralInfoModal = ({
  isOpen,
  onClose,
  type = "info", // 'success', 'error', 'warning', 'info'
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getModalStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-600",
          icon: "✓",
          iconBg: "bg-green-500",
        };
      case "error":
        return {
          bgColor: "bg-red-600",
          icon: "✕",
          iconBg: "bg-red-500",
        };
      case "warning":
        return {
          bgColor: "bg-yellow-600",
          icon: "⚠",
          iconBg: "bg-yellow-500",
        };
      default:
        return {
          bgColor: "bg-blue-600",
          icon: "ℹ",
          iconBg: "bg-blue-500",
        };
    }
  };

  const styles = getModalStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-4 right-0 md:right-4 z-40 max-w-sm w-full px-4 md:px-0"
          initial={{opacity: 0, x: 100, scale: 0.9}}
          animate={{opacity: 1, x: 0, scale: 1}}
          exit={{opacity: 0, x: 100, scale: 0.9}}
          transition={{type: "spring", damping: 20, stiffness: 300}}
        >
          <div
            className={`${styles.bgColor} text-white rounded-lg shadow-lg p-3 md:p-4 relative`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-1.5 right-1.5 md:top-2 md:right-2 text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-start gap-2 md:gap-3 pr-6 md:pr-8">
              {/* Icon */}
              <div
                className={`${styles.iconBg} rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <span className="text-white font-bold text-xs md:text-sm">
                  {styles.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="font-semibold text-xs md:text-sm mb-1 truncate">
                    {title}
                  </h3>
                )}
                <p className="text-xs md:text-sm opacity-90 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Progress bar for auto-close */}
            {autoClose && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg"
                initial={{width: "100%"}}
                animate={{width: "0%"}}
                transition={{duration: autoCloseDelay / 1000, ease: "linear"}}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GeneralInfoModal;
