"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Award,
  RotateCcw,
  Home,
} from "lucide-react";

const QuizResults = ({ results, onRetake, onExit, xpGained, levelUp }) => {
  const getGradeInfo = (score) => {
    if (score >= 90)
      return {
        grade: "A+",
        color: "from-green-500 to-emerald-500",
        message: "Outstanding! You're a master!",
        stars: 5,
      };
    if (score >= 80)
      return {
        grade: "A",
        color: "from-green-500 to-green-600",
        message: "Excellent work!",
        stars: 4,
      };
    if (score >= 70)
      return {
        grade: "B",
        color: "from-yellow-500 to-yellow-600",
        message: "Good job!",
        stars: 3,
      };
    if (score >= 60)
      return {
        grade: "C",
        color: "from-orange-500 to-orange-600",
        message: "Not bad, keep practicing!",
        stars: 2,
      };
    return {
      grade: "D",
      color: "from-red-500 to-red-600",
      message: "Keep studying, you'll improve!",
      stars: 1,
    };
  };

  const gradeInfo = getGradeInfo(results.score);
  const accuracy = Math.round(
    (results.correctAnswers / results.totalQuestions) * 100
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Confetti Animation (when score > 70) */}
          {results.score >= 70 && (
            <div className="fixed inset-0 pointer-events-none z-0">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: -20,
                    x: Math.random() * window.innerWidth,
                  }}
                  animate={{
                    opacity: 0,
                    y: window.innerHeight,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                  }}
                  className={`absolute w-2 h-2 ${
                    i % 3 === 0
                      ? "bg-yellow-400"
                      : i % 3 === 1
                      ? "bg-orange-500"
                      : "bg-green-400"
                  } rounded-full`}
                />
              ))}
            </div>
          )}

          {/* Level Up Banner */}
          {levelUp && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-2xl border-2 border-purple-400"
            >
              <div className="flex items-center justify-center gap-4">
                <Award className="w-12 h-12 text-white animate-bounce" />
                <div className="text-center">
                  <h3 className="text-white font-bold text-2xl">LEVEL UP!</h3>
                  <p className="text-purple-100 text-sm">
                    You've reached Level {levelUp}!
                  </p>
                </div>
                <Award className="w-12 h-12 text-white animate-bounce" />
              </div>
            </motion.div>
          )}

          {/* Main Results Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
          >
            {/* Header with Grade */}
            <div
              className={`relative bg-gradient-to-r ${gradeInfo.color} p-8 text-center`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Trophy className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-white font-bold text-4xl mb-2">
                  {gradeInfo.grade}
                </h2>
                <p className="text-white/90 text-lg">{gradeInfo.message}</p>
                <div className="flex items-center justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < gradeInfo.stars
                          ? "text-yellow-300 fill-yellow-300"
                          : "text-white/30"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Score Circle */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
              >
                <div className="relative w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {results.score}
                    </div>
                    <div className="text-xs text-gray-400">SCORE</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="p-8 mt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Correct Answers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {results.correctAnswers}
                  </div>
                  <div className="text-xs text-gray-400">Correct</div>
                </motion.div>

                {/* Wrong Answers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center"
                >
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-400">
                    {results.wrongAnswers}
                  </div>
                  <div className="text-xs text-gray-400">Wrong</div>
                </motion.div>

                {/* Time Taken */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center"
                >
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">
                    {formatTime(results.timeTaken)}
                  </div>
                  <div className="text-xs text-gray-400">Time Used</div>
                </motion.div>

                {/* Accuracy */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
                >
                  <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">
                    {accuracy}%
                  </div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </motion.div>
              </div>

              {/* XP Gained */}
              {xpGained && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <div>
                      <span className="text-white font-bold text-xl">
                        +{xpGained} XP
                      </span>
                      <p className="text-gray-400 text-sm">Experience Gained</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mistakes Review */}
              {results.mistakes && results.mistakes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mb-6"
                >
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Review Your Mistakes
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.mistakes.map((mistake, index) => {
                      console.log(`Mistake ${index}:`, mistake); // Debug log
                      return (
                        <div
                          key={index}
                          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                        >
                          <p className="text-white font-medium mb-3">
                            Q{mistake.questionIndex + 1}: {mistake.question}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-gray-400 text-sm">
                                  Your answer:
                                </span>
                                <p className="text-red-400 text-sm font-medium">
                                  {mistake.userAnswer}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-gray-400 text-sm">
                                  Correct answer:
                                </span>
                                <p className="text-green-400 text-sm font-medium">
                                  {mistake.correctAnswer}
                                </p>
                              </div>
                            </div>
                            {/* Always show explanation section */}
                            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-700">
                              <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                                <svg
                                  className="w-4 h-4 text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-400 text-sm block mb-1">
                                  Explanation:
                                </span>
                                <p className="text-blue-300 text-sm leading-relaxed">
                                  {mistake.explanation ||
                                    "No explanation available for this question."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={onRetake}
                  className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-gray-900 font-bold transition-all shadow-lg shadow-yellow-500/20"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Quiz
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-white font-medium transition-all"
                >
                  <Home className="w-5 h-5" />
                  Back to Quizzes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
