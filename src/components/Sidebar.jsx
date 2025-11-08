"use client";

import { useAuth } from "@/contexts/AuthContext";
import { deleteSingleChat, getChats } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { formatTimeAgo } from "../../utils/formatTime";
import DeleteModal from "./DeleteModal";
import GeneralInfoModal from "./GeneralInfoModal";

const Sidebar = ({ children }) => {
  const { user, userData } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [chats, setChats] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState(null);
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const path = usePathname(); // Limit path length for better performance

  const router = useRouter();

  const showModal = (type, title, message) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      console.log("Deleting chat:", chatToDelete.chatId, chatToDelete.topic);

      try {
        const res = await deleteSingleChat(chatToDelete.chatId, user?.uid);

        if (res.success) {
          console.log("Chat deleted successfully");
          showModal(
            "success",
            "Chat Deleted",
            "Chat has been successfully deleted."
          );

          // Refresh the chats list
          const updatedChats = await getChats(user.uid);
          if (updatedChats.success) {
            setChats(updatedChats.chats);
          }

          // If we're currently viewing the deleted chat, redirect to learn page
          if (window.location.pathname.includes(chatToDelete.chatId)) {
            router.push("/learn");
          }
        } else {
          console.error("Failed to delete chat:", res.message);
          showModal(
            "error",
            "Delete Failed",
            res.message || "Failed to delete chat. Please try again."
          );
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        showModal(
          "error",
          "Error",
          "An unexpected error occurred while deleting the chat."
        );
      }

      setShowDeleteModal(false);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
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
          showModal(
            "error",
            "Error Loading Chats",
            data.message || "Failed to load your chat history."
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching chats:", error);
        showModal(
          "error",
          "Network Error",
          "Unable to load chats. Please check your internet connection."
        );
      });
  }, [user?.uid, router]);

  useEffect(() => {
    if (user) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setEmail(user?.email || "");
    }
    // console.log(userData);
  }, [user, userData, router]);

  // Filter and group chats
  const filteredChats = React.useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter((chat) =>
      chat?.aiResponse?.courseTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const groupedChats = React.useMemo(() => {
    const now = new Date();
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      const diffTime = now - chatDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups.today.push(chat);
      } else if (diffDays === 1) {
        groups.yesterday.push(chat);
      } else if (diffDays <= 7) {
        groups.thisWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const renderChatItem = (chat, index) => (
    <div
      onClick={() => router.push(`/learn/chat/${chat.chatId}`)}
      key={chat.chatId}
      className={`rounded-xl cursor-pointer transition-all duration-200 group ${
        path === `/learn/chat/${chat.chatId}`
          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 shadow-lg"
          : "bg-gray-750/50 hover:bg-gray-700/70 border border-gray-600/30 hover:border-gray-500/50"
      }
      ${sidebarCollapsed ? "p-1" : "p-3"}
      `}
      title={
        sidebarCollapsed ? chat?.aiResponse?.courseTitle || "Untitled Chat" : ""
      }
    >
      {sidebarCollapsed ? (
        // Collapsed view - only show icon
        <div className="flex justify-center">
          <div
            className={`w-9 h-8 rounded-lg flex items-center justify-center ${
              path === `/learn/chat/${chat.chatId}`
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gray-600 group-hover:bg-gray-500"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                path === `/learn/chat/${chat.chatId}`
                  ? "text-gray-900"
                  : "text-gray-300"
              }`}
            >
              {chat?.aiResponse?.courseTitle?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        </div>
      ) : (
        // Expanded view - full content
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              path === `/learn/chat/${chat.chatId}`
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gray-600 group-hover:bg-gray-500"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                path === `/learn/chat/${chat.chatId}`
                  ? "text-gray-900"
                  : "text-gray-300"
              }`}
            >
              {chat?.aiResponse?.courseTitle?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium transition-colors truncate ${
                path === `/learn/chat/${chat.chatId}`
                  ? "text-yellow-400"
                  : "text-white group-hover:text-yellow-400"
              }`}
            >
              {chat?.aiResponse?.courseTitle || "Untitled Chat"}
            </p>
            {!searchQuery && (
              <p className="text-gray-400 text-xs mt-1">
                {formatTimeAgo(chat.timestamp)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => handleDeleteClick(e, chat)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Delete chat"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        chatToDelete={chatToDelete}
      />

      {/* General Info Modal for error/success messages */}
      <GeneralInfoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        autoClose={true}
        autoCloseDelay={4000}
      />

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
        ${
          sidebarCollapsed ? "w-20" : "w-80"
        } h-screen bg-gray-800 border-r border-gray-700 flex flex-col z-40 transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        fixed inset-y-0 left-0 transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        >
          {/* AceMind Logo/Title */}
          <div
            className={`p-4 w-full border-b border-gray-700 flex ${
              sidebarCollapsed ? "flex-col-reverse gap-3" : "flex-row"
            } justify-between items-center `}
          >
            <Link
              href={"/"}
              className={`flex-shrink-0 ${sidebarCollapsed ? "px-2" : ""}`}
            >
              {sidebarCollapsed ? (
                <div className="flex justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
                    <span className="text-2xl mr-2">🧠</span>
                    AceMind
                  </h1>
                  <p className="text-gray-400 text-xs mt-1">
                    AI-Powered Learning
                  </p>
                </>
              )}
            </Link>
            {/* Close button for mobile and Collapse button for desktop */}
            <div className="flex justify-between items-center p-0 lg:p-0">
              {/* Desktop collapse button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    sidebarCollapsed ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white ml-auto"
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
            </div>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col">
            {!sidebarCollapsed && (
              <>
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  New Chat
                </h3>
                <div
                  onClick={() => {
                    router.push("/learn");
                  }}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-200 group bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 hover:from-yellow-500/20 hover:to-orange-500/20 mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">+</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                      Start a New Chat
                    </span>
                  </div>
                </div>

                {/* Search Bar */}
                {chats.length > 5 && (
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-750/50 border border-gray-600/30 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/40 transition-colors"
                      />
                      <svg
                        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                  Recent Chats
                </h3>
              </>
            )}

            {/* Collapsed new chat button */}
            {sidebarCollapsed && (
              <div
                onClick={() => {
                  router.push("/learn");
                }}
                className="p-1 rounded-xl cursor-pointer transition-all duration-200 group bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 hover:from-yellow-500/20 hover:to-orange-500/20 mb-4 flex justify-center"
                title="Start a New Chat"
              >
                <div className="w-9 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">+</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {!user?.uid ? (
                // Skeleton loading for chats
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-gray-750/50 animate-pulse border border-gray-600/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-600 rounded mb-2 w-3/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : chats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-500">💬</span>
                  </div>
                  <div className="text-gray-400 text-sm font-medium">
                    No chats yet
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Start a conversation to see your chat history
                  </div>
                </div>
              ) : sidebarCollapsed ? (
                // Collapsed view - show all without grouping
                filteredChats
                  .slice(0, 15)
                  .map((chat, index) => renderChatItem(chat, index))
              ) : (
                // Grouped view
                <div className="space-y-3">
                  {/* Today's Chats */}
                  {groupedChats.today.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-500 px-2">Today</h4>
                      {groupedChats.today.map((chat, index) =>
                        renderChatItem(chat, index)
                      )}
                    </div>
                  )}

                  {/* Yesterday's Chats */}
                  {groupedChats.yesterday.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-500 px-2">Yesterday</h4>
                      {groupedChats.yesterday.map((chat, index) =>
                        renderChatItem(chat, index)
                      )}
                    </div>
                  )}

                  {/* This Week's Chats */}
                  {groupedChats.thisWeek.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-500 px-2">This Week</h4>
                      {groupedChats.thisWeek.map((chat, index) =>
                        renderChatItem(chat, index)
                      )}
                    </div>
                  )}

                  {/* Older Chats */}
                  {groupedChats.older.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-500 px-2">Older</h4>
                      {groupedChats.older.map((chat, index) =>
                        renderChatItem(chat, index)
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Render children if provided */}
          </div>

          {/* Quiz Section */}
          {!sidebarCollapsed && (
            <div className="mx-3 mb-3 space-y-3">
              <Link
                href="/learn/quizzes"
                className="block bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-3 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold group-hover:text-purple-400 transition-colors">
                        Quiz Center
                      </p>
                      <p className="text-gray-400 text-xs">
                        Test your knowledge
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Leaderboard Link */}
              <Link
                href="/leaderboard"
                className="block bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-3 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold group-hover:text-yellow-400 transition-colors">
                        Leaderboard
                      </p>
                      <p className="text-gray-400 text-xs">Compete globally</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-yellow-400 transition-colors">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Collapsed Quiz & Leaderboard Buttons */}
          {sidebarCollapsed && (
            <div className="mx-2 mb-3 space-y-2">
              <Link
                href="/learn/quizzes"
                className="block bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-2 transition-all duration-200"
                title="Quiz Center"
              >
                <div className="flex justify-center">
                  <div className="w-9 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link
                href="/leaderboard"
                className="block bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-2 transition-all duration-200"
                title="Leaderboard"
              >
                <div className="flex justify-center">
                  <div className="w-9 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* User Profile Section */}
          <Link
            href="/profile"
            className={`m-3  bg-gray-750/50 hover:bg-gray-700/70 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 flex-shrink-0 group ${
              sidebarCollapsed ? "mx-2 px-0 py-2 " : "p-4"
            }`}
            title={sidebarCollapsed ? `${firstName} ${lastName}` : ""}
          >
            {!user ? (
              // Skeleton loading for user profile
              <div
                className={`flex items-center animate-pulse ${
                  sidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
              >
                <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-600 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-600 rounded"></div>
                  </>
                )}
              </div>
            ) : (
              <div
                className={`flex items-center ${
                  sidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-yellow-500/20">
                  {user?.photoURL ? (
                    <Image
                      width={48}
                      height={48}
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-900">
                      {userData?.firstName?.[0]}
                      {userData?.lastName?.[0]}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-yellow-400 transition-colors">
                        {firstName} {lastName}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{email}</p>
                    </div>
                    <div className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-600/50">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            )}
          </Link>
        </aside>
        {
          /* Render children if provided */
          children ? (
            <div className="flex-1 md:mt-0 md:pt-0 pt-16 ">{children}</div>
          ) : null
        }
      </div>
    </>
  );
};

export default Sidebar;
