"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard } from "@/lib/db";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import BackBtn from "@/components/backBtn";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Star,
  Users,
} from "lucide-react";

const LeaderboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [filter, setFilter] = useState("all"); // all, top10, top50
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await getLeaderboard(100);
      if (result.success) {
        setLeaderboardData(result.data);

        // Find current user's rank
        const currentUserIndex = result.data.findIndex(
          (u) => u.uid === user?.uid
        );
        if (currentUserIndex !== -1) {
          setUserRank(currentUserIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFilteredData = () => {
    let filtered;
    switch (filter) {
      case "top10":
        filtered = leaderboardData.slice(0, 10);
        break;
      case "top50":
        filtered = leaderboardData.slice(0, 50);
        break;
      default:
        filtered = leaderboardData;
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    let totalItems;
    switch (filter) {
      case "top10":
        totalItems = Math.min(10, leaderboardData.length);
        break;
      case "top50":
        totalItems = Math.min(50, leaderboardData.length);
        break;
      default:
        totalItems = leaderboardData.length;
    }
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of leaderboard
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "from-orange-500/20 to-orange-600/20 border-orange-500/50";
      default:
        return "from-gray-800/50 to-gray-800/30 border-gray-700/50";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const handleUserClick = (uid) => {
    router.push(`/profile?uid=${uid}`);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <Sidebar>
        <div className="h-screen overflow-y-auto bg-gray-900">
          <motion.div className="p-4 md:pt-12">
            <motion.div
              className="max-w-6xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Header */}
              <div className="pb-2 md:py-5">
                <BackBtn />
              </div>

              <motion.div className="mb-8" variants={itemVariants}>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
                </div>
                <p className="text-gray-400">
                  Compete with learners worldwide and climb to the top!
                </p>
              </motion.div>

              {/* User's Rank Card */}
              {userRank && (
                <motion.div
                  className="mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-2xl p-4"
                  variants={itemVariants}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Your Rank</p>
                        <p className="text-white text-2xl font-bold">
                          #{userRank}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Out of</p>
                      <p className="text-white text-xl font-bold">
                        {leaderboardData.length} users
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Filter Tabs */}
              <motion.div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
                variants={itemVariants}
              >
                <div className="flex gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 w-fit">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "all"
                        ? "bg-yellow-500 text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => handleFilterChange("top10")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "top10"
                        ? "bg-yellow-500 text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Top 10
                  </button>
                  <button
                    onClick={() => handleFilterChange("top50")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "top50"
                        ? "bg-yellow-500 text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Top 50
                  </button>
                </div>

                {/* Page Info */}
                {!loading && getFilteredData().length > 0 && (
                  <div className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filter === "top10"
                        ? Math.min(10, leaderboardData.length)
                        : filter === "top50"
                        ? Math.min(50, leaderboardData.length)
                        : leaderboardData.length
                    )}{" "}
                    of{" "}
                    {filter === "top10"
                      ? Math.min(10, leaderboardData.length)
                      : filter === "top50"
                      ? Math.min(50, leaderboardData.length)
                      : leaderboardData.length}{" "}
                    users
                  </div>
                )}
              </motion.div>

              {/* Leaderboard List */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading leaderboard...</p>
                  </div>
                </div>
              ) : getFilteredData().length === 0 ? (
                <motion.div
                  className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50"
                  variants={itemVariants}
                >
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No users found</p>
                </motion.div>
              ) : (
                <motion.div className="space-y-3" variants={containerVariants}>
                  {getFilteredData().map((userData, index) => {
                    const rank = leaderboardData.indexOf(userData) + 1;
                    const isCurrentUser = userData.uid === user?.uid;

                    return (
                      <motion.div
                        key={userData.uid}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUserClick(userData.uid)}
                        className={`cursor-pointer bg-gradient-to-r ${getRankColor(
                          rank
                        )} rounded-2xl p-4 border transition-all ${
                          isCurrentUser
                            ? "ring-2 ring-purple-500"
                            : "hover:border-yellow-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Rank & User Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Rank */}
                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                              {getRankIcon(rank)}
                            </div>

                            {/* User Avatar & Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-gray-900">
                                  {userData.firstName?.[0] || "?"}
                                  {userData.lastName?.[0] || ""}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">
                                  {userData.displayName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-purple-500 px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {userData.quizStats.totalQuizzes} quizzes
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Stats */}
                          <div className="flex items-center gap-6 flex-shrink-0">
                            {/* Level */}
                            <div className="text-center hidden sm:block">
                              <div className="flex items-center gap-1 text-purple-400 mb-1">
                                <Award className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  Level
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-white">
                                {userData.quizStats.level}
                              </p>
                            </div>

                            {/* XP */}
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-yellow-400 mb-1">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-medium">XP</span>
                              </div>
                              <p className="text-xl font-bold text-white">
                                {userData.quizStats.xp}
                              </p>
                            </div>

                            {/* Avg Score */}
                            <div className="text-center hidden md:block">
                              <div className="flex items-center gap-1 text-green-400 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-medium">Avg</span>
                              </div>
                              <p className="text-xl font-bold text-white">
                                {Math.round(userData.quizStats.averageScore)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Top 3 Special Effects */}
                        {rank <= 3 && (
                          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-gray-400">
                              {rank === 1 && "🏆 Champion"}
                              {rank === 2 && "🥈 Runner-up"}
                              {rank === 3 && "🥉 Third Place"}
                            </span>
                            <Star className="w-4 h-4 text-yellow-400" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Pagination Controls */}
              {!loading &&
                getFilteredData().length > 0 &&
                getTotalPages() > 1 && (
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2"
                    variants={itemVariants}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === 1
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: getTotalPages() },
                        (_, i) => i + 1
                      ).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const totalPages = getTotalPages();
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                currentPage === page
                                  ? "bg-yellow-500 text-gray-900"
                                  : "bg-gray-800 text-white hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === getTotalPages()
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </motion.div>
                )}

              {/* Stats Summary */}
              <motion.div
                className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
                variants={itemVariants}
              >
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Leaderboard Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-white text-2xl font-bold">
                      {leaderboardData.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Level</p>
                    <p className="text-white text-2xl font-bold">
                      {leaderboardData.length > 0
                        ? Math.round(
                            leaderboardData.reduce(
                              (sum, u) => sum + u.quizStats.level,
                              0
                            ) / leaderboardData.length
                          )
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Quizzes</p>
                    <p className="text-white text-2xl font-bold">
                      {leaderboardData.reduce(
                        (sum, u) => sum + u.quizStats.totalQuizzes,
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Score</p>
                    <p className="text-white text-2xl font-bold">
                      {leaderboardData.length > 0
                        ? Math.round(
                            leaderboardData.reduce(
                              (sum, u) => sum + u.quizStats.averageScore,
                              0
                            ) / leaderboardData.length
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
};

export default LeaderboardPage;
