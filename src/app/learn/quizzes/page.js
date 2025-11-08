"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getChats, getUserQuizStats } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import QuizDashboard from "@/components/QuizDashboard";
import {
  Trophy,
  TrendingUp,
  Target,
  Zap,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function QuizzesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update URL when course is selected
  const handleCourseSelect = (chat) => {
    setSelectedChat(chat);
    setDropdownOpen(false);
    setSearchQuery("");

    // Update URL with course ID
    const params = new URLSearchParams(window.location.search);
    params.set("course", chat.chatId);
    window.history.replaceState({}, "", `/learn/quizzes?${params.toString()}`);
  };

  // Filter chats based on search
  const filteredChats = chats.filter((chat) =>
    chat?.aiResponse?.courseTitle
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Load user stats
        const statsResult = await getUserQuizStats(user.uid);
        if (statsResult.success) {
          setUserStats(statsResult.data);
        }

        // Load chats
        const chatsResult = await getChats(user.uid);
        if (chatsResult.success) {
          setChats(chatsResult.chats);

          // Get course ID from URL
          const courseIdFromUrl = searchParams.get("course");

          if (courseIdFromUrl) {
            // Try to find the chat from URL parameter
            const chatFromUrl = chatsResult.chats.find(
              (chat) => chat.chatId === courseIdFromUrl
            );

            if (chatFromUrl) {
              setSelectedChat(chatFromUrl);
            } else if (chatsResult.chats.length > 0) {
              // Fallback to first chat if URL course not found
              const firstChat = chatsResult.chats[0];
              setSelectedChat(firstChat);
              // Update URL with first chat
              const params = new URLSearchParams();
              params.set("course", firstChat.chatId);
              window.history.replaceState(
                {},
                "",
                `/learn/quizzes?${params.toString()}`
              );
            }
          } else if (chatsResult.chats.length > 0) {
            // Auto-select first chat if no URL parameter
            const firstChat = chatsResult.chats[0];
            setSelectedChat(firstChat);
            // Update URL with first chat
            const params = new URLSearchParams();
            params.set("course", firstChat.chatId);
            window.history.replaceState(
              {},
              "",
              `/learn/quizzes?${params.toString()}`
            );
          }
        }
      } catch (error) {
        console.error("Error loading quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router, searchParams]);

  if (loading || authLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="h-screen bg-gray-900 overflow-hidden flex flex-col">
        {/* Minimal Header */}
        <div className="border-b border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-400" />
              <div>
                <h1 className="text-white font-semibold text-lg sm:text-xl">
                  Quiz Center
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Test your knowledge
                </p>
              </div>
            </div>

            {/* Compact Stats */}
            {userStats && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400">Lv {userStats.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">{userStats.xp} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">
                    {Math.round(userStats.averageScore)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                <h2 className="text-white font-semibold text-xl mb-1">
                  No Courses Yet
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  Start learning to unlock quizzes
                </p>
                <button
                  onClick={() => router.push("/learn")}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                >
                  Start Learning
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Course Dropdown Selector */}
              <div className="border-b border-gray-800 mx-0 lg:mx-8 px-4 sm:px-6  py-3 bg-gray-900/50">
                <div className="max-w-6xl mx-auto relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full sm:w-auto min-w-[300px] flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {selectedChat?.aiResponse?.courseTitle?.[0]?.toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-white font-semibold text-sm truncate">
                          {selectedChat?.aiResponse?.courseTitle ||
                            "Select a course"}
                        </p>
                        <p className="text-purple-300 text-xs">
                          {selectedChat?.aiResponse?.units?.length || 0} units •
                          Click to change
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-purple-400 transition-transform flex-shrink-0 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setDropdownOpen(false)}
                        />

                        {/* Dropdown Content */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[400px] mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          {/* Search Bar */}
                          {chats.length > 5 && (
                            <div className="p-3 border-b border-gray-700">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search courses..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              </div>
                            </div>
                          )}

                          {/* Course List */}
                          <div className="max-h-[400px] overflow-y-auto">
                            {filteredChats.length === 0 ? (
                              <div className="p-6 text-center">
                                <p className="text-gray-400 text-sm">
                                  No courses found
                                </p>
                              </div>
                            ) : (
                              <div className="p-2">
                                {filteredChats.map((chat) => (
                                  <button
                                    key={chat.chatId}
                                    onClick={() => handleCourseSelect(chat)}
                                    className={`w-full text-left p-3 rounded-lg transition-all mb-1 ${
                                      selectedChat?.chatId === chat.chatId
                                        ? "bg-purple-500/20 border border-purple-500/50"
                                        : "hover:bg-gray-700/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          selectedChat?.chatId === chat.chatId
                                            ? "bg-gradient-to-br from-purple-500 to-blue-500"
                                            : "bg-gray-600"
                                        }`}
                                      >
                                        <span className="text-white font-bold text-sm">
                                          {chat?.aiResponse?.courseTitle?.[0]?.toUpperCase() ||
                                            "?"}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`text-sm font-medium truncate ${
                                            selectedChat?.chatId === chat.chatId
                                              ? "text-purple-300"
                                              : "text-white"
                                          }`}
                                        >
                                          {chat?.aiResponse?.courseTitle ||
                                            "Untitled Course"}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                          {chat?.aiResponse?.units?.length || 0}{" "}
                                          units
                                        </p>
                                      </div>
                                      {selectedChat?.chatId === chat.chatId && (
                                        <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Quiz Dashboard */}
              <div className="flex-1 overflow-hidden">
                {selectedChat ? (
                  <QuizDashboard
                    key={selectedChat.chatId}
                    chatId={selectedChat.chatId}
                    chatData={selectedChat}
                    onClose={() => router.push("/learn")}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">
                      Select a course to view quizzes
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Sidebar>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense
      fallback={
        <Sidebar>
          <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading quizzes...</p>
                </div>
              </div>
            </div>
          </div>
        </Sidebar>
      }
    >
      <QuizzesPageContent />
    </Suspense>
  );
}
