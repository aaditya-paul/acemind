"use client";

import React from "react";
import {motion, AnimatePresence} from "framer-motion";

const DeleteModal = ({isOpen, onClose, onConfirm, chatToDelete}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/20 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 max-w-md w-full shadow-2xl mx-4"
            initial={{scale: 0.9, opacity: 0, y: 20}}
            animate={{scale: 1, opacity: 1, y: 0}}
            exit={{scale: 0.9, opacity: 0, y: 20}}
            transition={{type: "spring", damping: 20, stiffness: 300}}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full mx-auto mb-3 md:mb-4">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-white text-center mb-2">
              Delete Chat
            </h3>

            {/* Message */}
            <p className="text-gray-400 text-center mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
              Are you sure you want to delete "
              {chatToDelete?.aiResponse?.courseTitle || "this chat"}"? This
              action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 md:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors border border-gray-600 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
