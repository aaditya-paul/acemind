"use client";

import {motion} from "framer-motion";
import React from "react";

const SubtopicSidebar = ({
  sidebarOpen,
  sidebarClose,
  subtopicData,
  children,
}) => {
  // Reusable sidebar content component
  const SidebarContent = ({isMobile = false}) => (
    <div className={`${isMobile ? "p-4 max-w-full" : "p-6"} overflow-x-hidden`}>
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`${
            isMobile ? "text-xl" : "text-xl"
          } font-semibold text-white truncate pr-2 flex-1`}
        >
          {subtopicData?.subtopicTitle || "Subtopic Details"}
        </h2>
        <button
          onClick={sidebarClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
        >
          <svg
            className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-white`}
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
      </div>

      {/* Sidebar Content */}
      <div className="space-y-6 overflow-x-hidden">
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-3">
            Learning Objectives
          </h3>
          <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded-lg">
            <p className="text-gray-300 break-words">
              {subtopicData?.objectives ||
                "Master the key concepts and practical applications of this topic."}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-3">Resources</h3>
          <div className={`space-y-${isMobile ? "3" : "2"}`}>
            <div className="bg-green-900/30 border border-green-700/50 p-4 rounded-lg">
              <span
                className={`${
                  isMobile ? "text-base" : "text-sm"
                } font-medium text-green-300 break-words`}
              >
                📚 Reading Material
              </span>
            </div>
            <div className="bg-purple-900/30 border border-purple-700/50 p-4 rounded-lg">
              <span
                className={`${
                  isMobile ? "text-base" : "text-sm"
                } font-medium text-purple-300 break-words`}
              >
                🎥 Video Lectures
              </span>
            </div>
            <div className="bg-orange-900/30 border border-orange-700/50 p-4 rounded-lg">
              <span
                className={`${
                  isMobile ? "text-base" : "text-sm"
                } font-medium text-orange-300 break-words`}
              >
                💡 Practice Exercises
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-3">Progress</h3>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Completion</span>
              <span className="text-sm font-medium text-white">0%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{width: "0%"}}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex h-full overflow-hidden">
        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "w-1/2 lg:w-2/3" : "w-full"
          }`}
        >
          {children}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <motion.div
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "spring", damping: 20, stiffness: 300}}
            className="w-1/2 lg:w-1/3 bg-gray-900 border-l border-gray-800 shadow-lg overflow-y-auto"
          >
            <SidebarContent />
          </motion.div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative w-full h-full overflow-x-hidden">
        {/* Main Content */}
        <div className="w-full h-full">{children}</div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={sidebarClose}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{x: "100%"}}
              animate={{x: 0}}
              exit={{x: "100%"}}
              transition={{type: "spring", damping: 25, stiffness: 300}}
              className="fixed top-0 right-0 w-screen h-screen bg-gray-900 z-50 overflow-y-auto overflow-x-hidden"
            >
              <SidebarContent isMobile={true} />
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default SubtopicSidebar;
