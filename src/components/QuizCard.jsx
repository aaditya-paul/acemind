"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Zap,
  Lock,
  Star,
  TrendingUp,
  Clock,
  History,
} from "lucide-react";

const QuizCard = ({ quiz, onClick, onViewResults, isLocked, index }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "from-green-500 to-emerald-500";
      case "intermediate":
        return "from-yellow-500 to-orange-500";
      case "advanced":
        return "from-orange-500 to-red-500";
      case "expert":
        return "from-red-500 to-purple-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return <Star className="w-4 h-4" />;
      case "intermediate":
        return <Target className="w-4 h-4" />;
      case "advanced":
        return <Zap className="w-4 h-4" />;
      case "expert":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
      className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col min-h-[280px] ${
        isLocked
          ? "bg-gray-800/50 border-gray-700/50 opacity-60"
          : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 hover:border-yellow-500/50 shadow-lg hover:shadow-yellow-500/20"
      }`}
    >
      {/* Lock Overlay - Only for truly locked quizzes */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl backdrop-blur-sm z-10">
          <div className="text-center px-4">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-medium">
              {quiz.description?.includes("Unlock by")
                ? quiz.description
                    .split(".")
                    .find((s) => s.includes("Unlock by"))
                    ?.trim() || "Complete previous quizzes"
                : "Complete previous quizzes"}
            </p>
          </div>
        </div>
      )}

      {/* Difficulty Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(
              quiz.difficulty
            )} text-white text-xs font-bold flex items-center gap-1.5 shadow-lg`}
          >
            {getDifficultyIcon(quiz.difficulty)}
            {quiz.difficulty.toUpperCase()}
          </div>
          {quiz.isRevision && (
            <div className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">
              📚 REVISION
            </div>
          )}
          {quiz.isSuperRevision && (
            <div className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold">
              ⭐ SUPER REVISION
            </div>
          )}
        </div>
        {quiz.xpReward && !isLocked && (
          <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <Zap className="w-3 h-3" />+{quiz.xpReward} XP
          </div>
        )}
      </div>

      {/* Quiz Title */}
      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
        {quiz.title}
      </h3>

      {/* Quiz Description - Fixed height container */}
      <div className="min-h-[40px] mb-3">
        {quiz.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Quiz Info */}
      <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5" />
          {quiz.questionCount} Questions
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {quiz.timeLimit} min
        </div>
      </div>

      {/* Best Score */}
      {quiz.bestScore !== undefined && quiz.bestScore !== null && !isLocked && (
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">Best Score:</span>
          <span className="text-sm font-bold text-green-400">
            {quiz.bestScore}%
          </span>
        </div>
      )}

      {/* Action Buttons - Fixed height container */}
      <div className="mt-auto pt-3 border-t border-gray-700/50 space-y-2">
        {/* Attempt Quiz Button - Always enabled when not locked */}
        <button
          onClick={isLocked ? undefined : onClick}
          disabled={isLocked}
          className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            isLocked
              ? "bg-gray-700/50 border border-gray-600/50 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg hover:shadow-yellow-500/50"
          }`}
        >
          <Zap className="w-4 h-4" />
          {isLocked ? "Locked" : quiz.isNew ? "Start Quiz" : "Re-attempt Quiz"}
        </button>

        {/* View Results Button - Only for attempted quizzes */}
        {quiz.bestScore !== undefined &&
          quiz.bestScore !== null &&
          !isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewResults?.();
              }}
              className="w-full px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              View Results History
            </button>
          )}
      </div>

      {/* New Badge */}
      {quiz.isNew && !isLocked && (
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-[10px] font-bold animate-pulse">
            NEW
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuizCard;
