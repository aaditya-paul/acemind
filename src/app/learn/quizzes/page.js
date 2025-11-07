"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getChats, getUserQuizStats } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import QuizDashboard from "@/components/QuizDashboard";
import { Trophy, TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function QuizzesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update URL when course is selected
  const handleCourseSelect = (chat) => {
    setSelectedChat(chat);

    // Update URL with course ID
    const params = new URLSearchParams(window.location.search);
    params.set("course", chat.chatId);
    window.history.replaceState({}, "", `/learn/quizzes?${params.toString()}`);
  };

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
        <div className="flex-1 overflow-hidden">
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
            <div className="flex flex-col sm:flex-row h-full">
              {/* Course Selector - Responsive */}
              <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-800 bg-gray-900/50 overflow-y-auto max-h-40 sm:max-h-full">
                <div className="p-3">
                  <h3 className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                    Courses
                  </h3>
                  <div className="space-y-1.5">
                    {chats.map((chat) => (
                      <button
                        key={chat.chatId}
                        onClick={() => handleCourseSelect(chat)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all ${
                          selectedChat?.chatId === chat.chatId
                            ? "bg-purple-500/20 border border-purple-500/50"
                            : "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                              selectedChat?.chatId === chat.chatId
                                ? "bg-purple-500"
                                : "bg-gray-700"
                            }`}
                          >
                            <span className="text-white font-semibold text-xs">
                              {chat?.aiResponse?.courseTitle?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                selectedChat?.chatId === chat.chatId
                                  ? "text-purple-300"
                                  : "text-gray-300"
                              }`}
                            >
                              {chat?.aiResponse?.courseTitle ||
                                "Untitled Course"}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {chat?.aiResponse?.units?.length || 0} units
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
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
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
