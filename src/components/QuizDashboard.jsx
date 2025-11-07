"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Award,
  Target,
  Clock,
} from "lucide-react";
import QuizCard from "./QuizCard";
import QuizInterface from "./QuizInterface";
import QuizResults from "./QuizResults";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuizResult, getQuizResults, getUserQuizStats } from "@/lib/db";

const QuizDashboard = ({ chatId, chatData, onClose }) => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]); // Store all results for a quiz
  const [selectedHistoryResult, setSelectedHistoryResult] = useState(null); // For viewing specific result

  useEffect(() => {
    if (chatId && user?.uid) {
      loadQuizData();
    }
  }, [chatId, user?.uid]);

  // Restore state from URL on mount
  useEffect(() => {
    const viewResultParam = searchParams.get("viewResult");
    if (viewResultParam && quizHistory.length > 0) {
      // Find the result by timestamp
      const result = quizHistory.find((r) => r.timestamp === viewResultParam);
      if (result) {
        setSelectedHistoryResult(result);
      }
    }
  }, [searchParams, quizHistory]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const viewResultParam = new URLSearchParams(window.location.search).get(
        "viewResult"
      );
      if (!viewResultParam) {
        // If viewResult is not in URL, clear the selected result
        setSelectedHistoryResult(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

      // Store all results for history viewing
      if (resultsData.success) {
        setQuizHistory(resultsData.data);
      }
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

    // Intermediate Quizzes - Progressive unlock based on completion
    if (studyDepth >= 1 || previousResults.length > 0) {
      // Determine how many intermediate quizzes to create based on completion
      let intermediatesToCreate = 1; // Always create at least first intermediate

      // Check completion of intermediate quizzes to unlock more
      for (let i = 0; i < Math.min(units.length, 3); i++) {
        const quizId = `quiz-intermediate-unit-${i}`;
        const result = previousResults.find((r) => r.quizId === quizId);

        if (result && result.score >= 50) {
          // If this intermediate is completed with 50%+, unlock next one
          intermediatesToCreate = Math.min(i + 2, units.length, 3);
        }
      }

      // Create the unlocked intermediate quizzes
      for (let index = 0; index < intermediatesToCreate; index++) {
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
      console.log("🎯 ADVANCED QUIZ CHECK:");
      console.log("   Study Depth:", studyDepth);
      console.log(
        "   Has Completed Intermediate:",
        hasCompletedDifficulty(previousResults, "intermediate")
      );
      console.log("   Previous Results:", previousResults);

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

      console.log("✅ Advanced quiz created!");
    } else {
      console.log("❌ ADVANCED QUIZ NOT CREATED:");
      console.log("   Study Depth:", studyDepth, "(needs ≥2)");
      console.log(
        "   Has Completed Intermediate:",
        hasCompletedDifficulty(previousResults, "intermediate"),
        "(needs true)"
      );
      console.log("   Previous Results:", previousResults);
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

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/api/generate-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicString,
            difficulty,
            questionCount: count,
            courseContext,
          }),
        }
      );

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

  const handleViewResults = (quizId) => {
    // Get all results for this specific quiz
    const results = quizHistory.filter((r) => r.quizId === quizId);

    // If there are results, show the most recent one directly
    if (results.length > 0) {
      const mostRecentResult = results.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      handleViewSpecificResult(mostRecentResult);
    }
  };

  const handleViewSpecificResult = (result) => {
    setSelectedHistoryResult(result);

    // Update URL with result timestamp
    const url = new URL(window.location);
    url.searchParams.set("viewResult", result.timestamp);
    window.history.pushState({}, "", url);
  };

  const handleExitHistoryResult = () => {
    // Use browser back to maintain history stack
    window.history.back();
  };

  const isQuizLocked = (quizIndex) => {
    if (quizIndex === 0) return false; // First quiz always unlocked

    const currentQuiz = quizzes[quizIndex];
    if (!currentQuiz) return false;

    // Get the difficulty hierarchy
    const difficultyOrder = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
      expert: 3,
    };

    const currentDifficulty = difficultyOrder[currentQuiz.difficulty] || 0;

    // For intermediate quizzes, require sequential completion
    if (currentQuiz.difficulty === "intermediate" && quizIndex > 1) {
      const previousQuiz = quizzes[quizIndex - 1];
      if (previousQuiz && previousQuiz.difficulty === "intermediate") {
        // Must complete previous intermediate quiz with 50%+ to unlock next
        return (
          previousQuiz.bestScore === undefined || previousQuiz.bestScore < 50
        );
      }
    }

    // Check difficulty-based unlock requirements
    if (currentDifficulty === 0) {
      return false; // Beginner always unlocked
    } else if (currentDifficulty === 1) {
      // Intermediate: Check if beginner completed with 50%+
      return !quizzes.some(
        (q) =>
          difficultyOrder[q.difficulty] === 0 &&
          q.bestScore !== undefined &&
          q.bestScore >= 50
      );
    } else if (currentDifficulty === 2) {
      // Advanced: Check if any intermediate completed with 60%+
      return !quizzes.some(
        (q) =>
          difficultyOrder[q.difficulty] === 1 &&
          q.bestScore !== undefined &&
          q.bestScore >= 60
      );
    } else if (currentDifficulty === 3) {
      // Expert: Check if advanced completed with 80%+
      return !quizzes.some(
        (q) =>
          difficultyOrder[q.difficulty] === 2 &&
          q.bestScore !== undefined &&
          q.bestScore >= 80
      );
    }

    return false;
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

  // Show results from history
  if (selectedHistoryResult) {
    return (
      <QuizResults
        results={{
          score: selectedHistoryResult.score,
          correctAnswers: selectedHistoryResult.correctAnswers,
          wrongAnswers: selectedHistoryResult.wrongAnswers,
          totalQuestions: selectedHistoryResult.totalQuestions,
          timeTaken: selectedHistoryResult.timeTaken,
          mistakes: selectedHistoryResult.mistakes || [],
          xpGained: selectedHistoryResult.xpGained || 0,
          leveledUp: false, // Don't show level up for history
        }}
        onExit={handleExitHistoryResult}
        difficulty={selectedHistoryResult.difficulty}
      />
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
                  onViewResults={() => handleViewResults(quiz.id)}
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
                Unlock Requirements
              </h4>
              <ul className="text-gray-400 text-xs space-y-0.5">
                <li>
                  🟢 <span className="text-green-400">Beginner</span> → Always
                  available
                </li>
                <li>
                  🟡 <span className="text-yellow-400">Intermediate</span> →
                  Score ≥50% on Beginner
                </li>
                <li>
                  🟠 <span className="text-orange-400">Advanced</span> → Score
                  ≥60% on any Intermediate
                </li>
                <li>
                  🔴 <span className="text-red-400">Expert</span> → Score ≥80%
                  on Advanced
                </li>
              </ul>
              <p className="text-gray-500 text-xs mt-2">
                Harder quizzes give more XP • Maintain daily streak for bonus
                rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
