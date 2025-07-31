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
      {/* Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 h-full pt-16 lg:pt-4">
          <StudyFormContent />
        </main>
      </Sidebar>
    </div>
  );
};

export default ResponsiveStudyForm;
