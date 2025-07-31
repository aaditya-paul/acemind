"use client";

import React, {useState} from "react";
import Sidebar from "./Sidebar";
import StudyFormContent from "./StudyFormContent";

const ResponsiveStudyForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-900 flex relative ${
        sidebarOpen ? "overflow-hidden" : ""
      } md:overflow-hidden`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={` ${
          sidebarOpen ? "hidden" : "block"
        } lg:hidden fixed top-4 left-4 z-50 p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-colors shadow-lg`}
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 h-full pt-16 lg:pt-4">
        <StudyFormContent />
      </main>
    </div>
  );
};

export default ResponsiveStudyForm;
