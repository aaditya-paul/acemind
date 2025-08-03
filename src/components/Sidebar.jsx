"use client";

import {useAuth} from "@/contexts/AuthContext";
import {getChats} from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import React, {useEffect} from "react";

const Sidebar = ({children}) => {
  const {user, userData} = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [chats, setChats] = React.useState([]);
  const path = usePathname(); // Limit path length for better performance

  const router = useRouter();

  // Function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const now = Date.now();
    const chatTime = new Date(timestamp).getTime();
    const diffInMs = now - chatTime;

    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    // Only fetch chats if user.uid exists
    if (!user?.uid) {
      return;
    }

    getChats(user.uid)
      .then((data) => {
        if (data.success) {
          // set in ascending order
          let chatOrder = data.chats.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setChats(chatOrder);
        } else {
          console.error("Failed to fetch chats:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching chats:", error);
      });
  }, [user?.uid, router]);

  useEffect(() => {
    if (user) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setEmail(user?.email || "");
    }
    console.log(userData);
  }, [user, userData]);

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-transparent backdrop-blur-lg bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
        w-80 h-screen bg-gray-800 border-r border-gray-700 flex flex-col z-40
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
          <Link
            href={"/learn"}
            className="p-4 border-b border-gray-700 flex-shrink-0"
          >
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              AceMind
            </h1>
            <p className="text-gray-400 text-xs mt-1">AI-Powered Learning</p>
          </Link>

          {/* Chat History Section */}
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Recent Chats
            </h3>
            <div className="space-y-2">
              {!user?.uid ? (
                // Skeleton loading for chats
                Array.from({length: 3}).map((_, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg bg-gray-750 animate-pulse"
                  >
                    <div className="h-3 bg-gray-600 rounded mb-2 w-3/4"></div>
                    <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              ) : chats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No chats yet</div>
                  <div className="text-gray-600 text-xs mt-1">
                    Start a conversation to see your chat history
                  </div>
                </div>
              ) : (
                chats.map((chat, index) => (
                  <div
                    onClick={() => router.push(`/learn/chat/${chat.chatId}`)}
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                      path === `/learn/chat/${chat.chatId}`
                        ? "bg-gray-700 border border-yellow-500/30"
                        : "bg-gray-750 hover:bg-gray-700"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium transition-colors ${
                        path === `/learn/chat/${chat.chatId}`
                          ? "text-yellow-400"
                          : "text-white group-hover:text-yellow-400"
                      }`}
                    >
                      {chat.topic || "Untitled Chat"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatTimeAgo(chat.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Render children if provided */}
          </div>

          {/* User Profile Section */}
          <Link
            href="/profile"
            className={`hover:cursor-pointer hover:bg-gray-800/70 hover:shadow hover:rounded-2xl hover:ring-slate-900 transition-all ease-linear   p-3 border-t border-gray-700 flex-shrink-0`}
          >
            {!user ? (
              // Skeleton loading for user profile
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 bg-gray-600 rounded mb-1 w-3/4"></div>
                  <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  {user?.photoURL ? (
                    <Image
                      width={40}
                      height={40}
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {userData?.firstName?.[0]}
                      {userData?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{email}</p>
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
            )}
          </Link>
        </aside>
        {
          /* Render children if provided */
          children ? (
            <div className="flex-1 md:mt-0 mt-16">{children}</div>
          ) : null
        }
      </div>
    </>
  );
};

export default Sidebar;
