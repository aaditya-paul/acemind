"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Award,
  Target,
  Clock,
  X,
} from "lucide-react";
import QuizCard from "./QuizCard";
import QuizInterface from "./QuizInterface";
import QuizResults from "./QuizResults";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuizResult, getQuizResults, getUserQuizStats } from "@/lib/db";

const QuizDashboard = ({ chatId, chatData, onClose }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(null);

  useEffect(() => {
    if (chatId && user?.uid) {
      loadQuizData();
    }
  }, [chatId, user?.uid]);

  const loadQuizData = async () => {
    try {
      // Load user stats
      const statsResult = await getUserQuizStats(user.uid);
      if (statsResult.success) {
        setUserStats(statsResult.data);
        setPreviousLevel(statsResult.data.level);
      }

      // Load previous quiz results
      const resultsData = await getQuizResults(chatId, user.uid);

      // Generate quizzes based on chat content and depth
      const generatedQuizzes = await generateQuizzesFromContent(
        chatData,
        resultsData.success ? resultsData.data : []
      );

      setQuizzes(generatedQuizzes);
    } catch (error) {
      console.error("Error loading quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuizzesFromContent = async (chatData, previousResults) => {
    const quizList = [];
    const courseTitle = chatData?.aiResponse?.courseTitle || "Untitled Course";
    const units = chatData?.aiResponse?.units || [];
    const studyDepth = calculateStudyDepth(chatData);

    // Skip if no units available
    if (units.length === 0) {
      console.warn("⚠️ No units found in chat data");
      return quizList;
    }

    // Beginner Quizzes - Always available (questions generated on-demand)
    quizList.push({
      id: `quiz-beginner-overview`,
      title: `${courseTitle} - Quick Overview`,
      difficulty: "beginner",
      questionCount: 10,
      timeLimit: 10,
      xpReward: 50,
      isNew: previousResults.length === 0,
      questions: null, // Will be generated when quiz is started
      units: units,
      courseTitle: courseTitle,
      bestScore: getBestScore(previousResults, `quiz-beginner-overview`),
    });

    // Intermediate Quizzes - Unlocked after beginner
    if (studyDepth >= 1 || previousResults.length > 0) {
      for (let index = 0; index < Math.min(units.length, 3); index++) {
        const unit = units[index];
        const unitTitle = unit.unit_title || `Unit ${index + 1}`;

        quizList.push({
          id: `quiz-intermediate-unit-${index}`,
          title: `${unitTitle} - Deep Dive`,
          difficulty: "intermediate",
          questionCount: 15,
          timeLimit: 15,
          xpReward: 100,
          isNew: isNewQuiz(previousResults, `quiz-intermediate-unit-${index}`),
          questions: null, // Will be generated when quiz is started
          units: [unit],
          courseTitle: courseTitle,
          bestScore: getBestScore(
            previousResults,
            `quiz-intermediate-unit-${index}`
          ),
        });
      }
    }

    // Advanced Quizzes - Unlocked after completing intermediate
    if (
      studyDepth >= 2 ||
      hasCompletedDifficulty(previousResults, "intermediate")
    ) {
      quizList.push({
        id: `quiz-advanced-comprehensive`,
        title: `${courseTitle} - Comprehensive Challenge`,
        difficulty: "advanced",
        questionCount: 20,
        timeLimit: 25,
        xpReward: 200,
        isNew: isNewQuiz(previousResults, `quiz-advanced-comprehensive`),
        questions: null, // Will be generated when quiz is started
        units: units,
        courseTitle: courseTitle,
        bestScore: getBestScore(previousResults, `quiz-advanced-comprehensive`),
      });
    }

    // Expert Quizzes - Unlocked after high performance in advanced
    if (
      studyDepth >= 3 ||
      hasHighPerformance(previousResults, "advanced", 80)
    ) {
      quizList.push({
        id: `quiz-expert-mastery`,
        title: `${courseTitle} - Master's Challenge`,
        difficulty: "expert",
        questionCount: 30,
        timeLimit: 40,
        xpReward: 500,
        isNew: isNewQuiz(previousResults, `quiz-expert-mastery`),
        questions: null, // Will be generated when quiz is started
        units: units,
        courseTitle: courseTitle,
        bestScore: getBestScore(previousResults, `quiz-expert-mastery`),
      });
    }

    return quizList;
  };

  const calculateStudyDepth = (chatData) => {
    // Calculate depth based on subtopics viewed and time spent
    const subtopics = chatData?.subtopics || [];
    const viewedCount = subtopics.filter((s) => s.viewed).length;

    if (viewedCount === 0) return 0;
    if (viewedCount < 3) return 1;
    if (viewedCount < 6) return 2;
    return 3;
  };

  const generateQuestionsFromUnits = async (
    units,
    count,
    difficulty,
    courseTitle = "Course"
  ) => {
    // Validate units have content
    if (!units || units.length === 0) {
      console.warn("⚠️ No units provided for quiz generation");
      return getFallbackQuestions(count, difficulty, courseTitle);
    }

    try {
      // Extract topics from units, with fallback
      const topics = units
        .flatMap((u) => {
          const unitTitle = u.unit_title || "General Topic";
          const subTopics = u.sub_topics || [];
          return [unitTitle, ...subTopics];
        })
        .filter(Boolean)
        .slice(0, 8); // Limit to 8 topics

      // If no valid topics found, use course title
      const topicString =
        topics.length > 0
          ? topics.join(", ")
          : courseTitle || "General Knowledge";

      const courseContext = units
        .map((u, idx) => {
          const title = u.unit_title || `Unit ${idx + 1}`;
          const subTopics = u.sub_topics || [];
          return `${title}: ${subTopics.join(", ") || "General concepts"}`;
        })
        .join("\n");

      console.log(
        `🎯 Generating ${count} ${difficulty} questions for: ${topicString.substring(
          0,
          50
        )}...`
      );

      const response = await fetch("http://localhost:8000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicString,
          difficulty,
          questionCount: count,
          courseContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Backend error (${response.status}): ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      if (data.success && data.questions && data.questions.length > 0) {
        console.log(
          `✅ Generated ${data.questions.length} questions from backend`
        );
        return data.questions;
      } else {
        console.error("❌ Backend returned no questions:", data);
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error(
        "❌ Error generating questions from backend:",
        error.message
      );
      console.log("⚠️ Using fallback placeholder questions");
      return getFallbackQuestions(count, difficulty, courseTitle);
    }
  };

  const getFallbackQuestions = (count, difficulty, courseTitle) => {
    console.warn("⚠️ Generating fallback questions - Backend unavailable");
    return Array.from({ length: count }, (_, i) => ({
      question: `[Backend Unavailable] Sample ${difficulty} question ${
        i + 1
      } for ${courseTitle}`,
      options: [
        "Start backend server (port 8000)",
        "Check API endpoint configuration",
        "Verify Gemini API key in .env",
        "Check browser console for errors",
      ],
      correctAnswer: 0,
      difficulty,
      explanation: `This is a placeholder question. Please ensure:\n1. Backend server is running: cd acemind-backend && npm start\n2. Port 8000 is not blocked\n3. GEMINI_API_KEY is set in .env file`,
    }));
  };

  const generateQuestionsFromUnit = async (
    unit,
    count,
    difficulty,
    courseTitle
  ) => {
    return generateQuestionsFromUnits([unit], count, difficulty, courseTitle);
  };

  const getBestScore = (results, quizId) => {
    const quizResults = results.filter((r) => r.quizId === quizId);
    if (quizResults.length === 0) return undefined;
    return Math.max(...quizResults.map((r) => r.score));
  };

  const isNewQuiz = (results, quizId) => {
    return !results.some((r) => r.quizId === quizId);
  };

  const hasCompletedDifficulty = (results, difficulty) => {
    return results.some((r) => r.difficulty === difficulty && r.score >= 60);
  };

  const hasHighPerformance = (results, difficulty, minScore) => {
    return results.some(
      (r) => r.difficulty === difficulty && r.score >= minScore
    );
  };

  const handleQuizComplete = async (results) => {
    // Save to database
    const saveResult = await saveQuizResult(chatId, user.uid, results);

    if (saveResult.success) {
      setQuizResults(results);

      // Reload stats to check for level up
      const statsResult = await getUserQuizStats(user.uid);
      if (statsResult.success) {
        setUserStats(statsResult.data);
      }
    }
  };

  const handleRetakeQuiz = () => {
    setQuizResults(null);
    // Keep the activeQuiz, which will restart it
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setQuizResults(null);
    loadQuizData(); // Reload to update stats and unlock new quizzes
  };

  const isQuizLocked = (quizIndex) => {
    if (quizIndex === 0) return false; // First quiz always unlocked

    // Check if previous quiz has been attempted with at least 50% score
    const previousQuiz = quizzes[quizIndex - 1];
    if (!previousQuiz) return false;

    const previousBestScore = previousQuiz.bestScore;
    return previousBestScore === undefined || previousBestScore < 50;
  };

  const handleStartQuiz = async (quiz) => {
    // If questions already generated, use them
    if (quiz.questions && quiz.questions.length > 0) {
      setActiveQuiz(quiz);
      return;
    }

    // Otherwise, generate questions now
    console.log(`📝 Generating questions for quiz: ${quiz.title}`);
    setLoading(true);

    try {
      const questions = await generateQuestionsFromUnits(
        quiz.units,
        quiz.questionCount,
        quiz.difficulty,
        quiz.courseTitle
      );

      // Update quiz with generated questions
      const updatedQuiz = { ...quiz, questions };
      setActiveQuiz(updatedQuiz);

      // Update quizzes array to cache the questions
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((q) => (q.id === quiz.id ? updatedQuiz : q))
      );
    } catch (error) {
      console.error("Error generating quiz questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getXPForNextLevel = () => {
    if (!userStats) return 100;
    return (userStats.level + 1) * 100;
  };

  const getXPProgress = () => {
    if (!userStats) return 0;

    // Simply calculate percentage of current XP vs next level XP
    // This matches the display: {userStats.xp} / {getXPForNextLevel()}
    const nextLevelXP = getXPForNextLevel();
    const progress = Math.max(
      0,
      Math.min(100, (userStats.xp / nextLevelXP) * 100)
    );

    return progress;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (activeQuiz && !quizResults) {
    return (
      <QuizInterface
        quiz={activeQuiz}
        onComplete={handleQuizComplete}
        onExit={() => setActiveQuiz(null)}
      />
    );
  }

  // Show results
  if (quizResults) {
    const xpGained = Math.floor(
      quizResults.score * 10 + quizResults.correctAnswers * 5
    );
    const levelUp =
      userStats && previousLevel && userStats.level > previousLevel
        ? userStats.level
        : null;

    return (
      <QuizResults
        results={quizResults}
        onRetake={handleRetakeQuiz}
        onExit={handleExitQuiz}
        xpGained={xpGained}
        levelUp={levelUp}
      />
    );
  }

  // Show dashboard
  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Minimal Stats Bar */}
        {userStats && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-lg font-semibold text-purple-400">
                      {userStats.level}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500">Quizzes</p>
                    <p className="text-lg font-semibold text-blue-400">
                      {userStats.totalQuizzes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500">Avg</p>
                    <p className="text-lg font-semibold text-green-400">
                      {Math.round(userStats.averageScore)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact XP Bar */}
              <div className="flex-1 min-w-[200px] max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    XP to Lv {userStats.level + 1}
                  </span>
                  <span className="text-xs font-medium text-yellow-400">
                    {userStats.xp} / {getXPForNextLevel()}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${getXPProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Grid */}
        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
            Available Quizzes
          </h3>
          {quizzes.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No quizzes available</p>
              <p className="text-gray-600 text-xs mt-1">
                Start learning to unlock quizzes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onClick={() => handleStartQuiz(quiz)}
                  isLocked={isQuizLocked(index)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Compact Tips */}
        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-purple-400 font-medium text-xs mb-1">
                Quick Tips
              </h4>
              <p className="text-gray-400 text-xs">
                Score 50%+ to unlock next quiz • Maintain daily streak for bonus
                XP • Harder quizzes give more rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
