"use client";

import React from "react";

const Sidebar = ({sidebarOpen, setSidebarOpen, children}) => {
  const chatHistory = [
    {title: "JavaScript Fundamentals", time: "2 hours ago"},
    {title: "React Components", time: "1 day ago"},
    {title: "CSS Grid Layout", time: "3 days ago"},
    {title: "Python Data Structures", time: "1 week ago"},
    {title: "Machine Learning Basics", time: "2 weeks ago"},
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-transparent backdrop-blur-lg bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-80 bg-gray-800 border-r border-gray-700 flex flex-col z-40
        lg:relative lg:translate-x-0
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <svg
            className="w-6 h-6"
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

        {/* AceMind Logo/Title */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <span className="text-2xl mr-2">🧠</span>
            AceMind
          </h1>
          <p className="text-gray-400 text-xs mt-1">AI-Powered Learning</p>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 p-3 overflow-y-auto min-h-0">
          <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
            Recent Chats
          </h3>
          <div className="space-y-2">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className="p-2 rounded-lg bg-gray-750 hover:bg-gray-700 cursor-pointer transition-all duration-200 group"
              >
                <p className="text-white text-xs font-medium group-hover:text-yellow-400 transition-colors">
                  {chat.title}
                </p>
                <p className="text-gray-400 text-xs mt-1">{chat.time}</p>
              </div>
            ))}
          </div>

          {/* Render children if provided */}
          {children && <div className="mt-4">{children}</div>}
        </div>

        {/* User Profile Section */}
        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-bold text-sm">AP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                Aaditya Paul
              </p>
              <p className="text-gray-400 text-xs truncate">
                aaditya@example.com
              </p>
            </div>
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
