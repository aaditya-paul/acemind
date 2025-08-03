"use client";

import {useAuth} from "@/contexts/AuthContext";
import {deleteSingleChat, getChats} from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {formatTimeAgo} from "../../utils/formatTime";
import {DeleteModal, GeneralInfoModal} from "./modal";

const Sidebar = ({children}) => {
  const {user, userData} = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [chats, setChats] = React.useState([]);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState(null);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const path = usePathname(); // Limit path length for better performance

  const router = useRouter();

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      console.log("Deleting chat:", chatToDelete.chatId, chatToDelete.topic);
      // TODO: Add actual delete logic here
      setShowDeleteModal(false);
      setChatToDelete(null);
      const res = await deleteSingleChat(chatToDelete.chatId, user?.uid);
      if (res.success) {
        console.log("Chat deleted successfully");
        window.location.reload(); // Reload to reflect changes
      } else {
        console.error("Failed to delete chat:", res.message);
        setShowInfoModal(true);
        // alert("Failed to delete chat. Please try again.");
      }
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
    // console.log(userData);
  }, [user, userData, router]);

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        chatToDelete={chatToDelete}
      />
      {/* Info Modal */}
      <GeneralInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        info={{
          title: "Chat Deletion",
          message: "Failed to delete chat. Please try again later.",
        }}
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
            href={"/"}
            className="p-4 border-b border-gray-700 flex-shrink-0"
          >
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              AceMind
            </h1>
            <p className="text-gray-400 text-xs mt-1">AI-Powered Learning</p>
          </Link>

          {/* Chat History Section */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              New Chat
            </h3>
            <div
              onClick={() => {
                router.push("/learn");
              }}
              className="p-3 rounded-xl cursor-pointer transition-all duration-200 group bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 hover:from-yellow-500/20 hover:to-orange-500/20 mb-6"
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
            <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Recent Chats
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!user?.uid ? (
                // Skeleton loading for chats
                Array.from({length: 3}).map((_, index) => (
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
              ) : (
                chats.map((chat, index) => (
                  <div
                    onClick={() => router.push(`/learn/chat/${chat.chatId}`)}
                    key={index}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                      path === `/learn/chat/${chat.chatId}`
                        ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 shadow-lg"
                        : "bg-gray-750/50 hover:bg-gray-700/70 border border-gray-600/30 hover:border-gray-500/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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
                          {chat.topic?.[0]?.toUpperCase() || "?"}
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
                          {chat.topic || "Untitled Chat"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatTimeAgo(chat.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, chat)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
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
                  </div>
                ))
              )}
            </div>

            {/* Render children if provided */}
          </div>

          {/* User Profile Section */}
          <Link
            href="/profile"
            className="m-3 p-4 bg-gray-750/50 hover:bg-gray-700/70 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 flex-shrink-0 group"
          >
            {!user ? (
              // Skeleton loading for user profile
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-600 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
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
