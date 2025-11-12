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
  Lock,
} from "lucide-react";
import QuizCard from "./QuizCard";
import QuizInterface from "./QuizInterface";
import QuizResults from "./QuizResults";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuizResult, getQuizResults, getUserQuizStats } from "@/lib/db";

// Helper function to get time limit based on difficulty and question count
const getTimeLimit = (difficulty, questionCount) => {
  const timePerQuestion = {
    beginner: 30, // 30 seconds per question
    intermediate: 40, // 40 seconds per question
    advanced: 75, // 75 seconds per question
    expert: 80, // 80 seconds per question
  };

  const secondsPerQ = timePerQuestion[difficulty] || 60;
  return Math.ceil((questionCount * secondsPerQ) / 60); // Return in minutes
};

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
    const subtopics = chatData?.subtopics || [];

    // Determine studied units (units that were opened in mindmap)
    const studiedUnits = getStudiedUnits(units, subtopics);
    const hasSubtopicData =
      subtopics.length > 0 && subtopics.some((s) => s.viewed);

    console.log("📚 QUIZ GENERATION:");
    console.log("   Total Units:", units.length);
    console.log("   Studied Units:", studiedUnits.length);
    console.log("   Has Subtopic Data:", hasSubtopicData);

    // Skip if no units available
    if (units.length === 0) {
      console.warn("⚠️ No units found in chat data");
      return quizList;
    }

    // Helper functions for unlock logic
    const hasCompletedQuiz = (quizId, minScore) => {
      const quizResults = previousResults.filter((r) => r.quizId === quizId);
      return quizResults.some((r) => r.score >= minScore);
    };

    const getBestScore = (results, quizId) => {
      const quizResults = results.filter((r) => r.quizId === quizId);
      if (quizResults.length === 0) return null;
      return Math.max(...quizResults.map((r) => r.score));
    };

    const isNewQuiz = (results, quizId) => {
      return !results.some((r) => r.quizId === quizId);
    };

    const getCompletedIntermediateUnits = () => {
      return previousResults
        .filter(
          (r) =>
            r.quizId?.startsWith("quiz-intermediate-unit-") && r.score >= 50
        )
        .map((r) => {
          const match = r.quizId.match(/quiz-intermediate-unit-(\d+)/);
          return match ? parseInt(match[1]) : -1;
        })
        .filter((index) => index >= 0);
    };

    const getAdvancedUnlockPoint = () => {
      // Find the first intermediate quiz that scored >= 70%
      for (let i = 0; i < units.length; i++) {
        if (hasCompletedQuiz(`quiz-intermediate-unit-${i}`, 70)) {
          return i + 1; // Return number of units to include (1-indexed)
        }
      }
      return null;
    };

    // 1. BEGINNER QUIZ - Always available
    quizList.push({
      id: `quiz-beginner-overview`,
      title: `${courseTitle} - Quick Overview`,
      description:
        "General overview based on course syllabus. Test your prior knowledge!",
      difficulty: "beginner",
      questionCount: 10,
      timeLimit: 5,
      xpReward: 30, // Max ~70 XP (10 correct * 2 + 50 score * 0.5)
      isNew: previousResults.length === 0,
      questions: null,
      units: units, // All units for general questions
      courseTitle: courseTitle,
      bestScore: getBestScore(previousResults, `quiz-beginner-overview`),
      locked: false,
    });

    // 2. INTERMEDIATE QUIZZES - One per unit, sequential unlocking
    let revisionCount = 0;
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];
      const unitTitle = unit.unit_title || `Unit ${index + 1}`;
      const quizId = `quiz-intermediate-unit-${index}`;

      // Sequential unlocking: Unit N requires Unit N-1 with >= 50%
      const isLocked =
        index > 0 &&
        !hasCompletedQuiz(`quiz-intermediate-unit-${index - 1}`, 50);

      quizList.push({
        id: quizId,
        title: `${unitTitle} - Deep Dive`,
        description: `In-depth assessment of ${unitTitle}. Tests core concepts and applications.`,
        difficulty: "intermediate",
        questionCount: 15,
        timeLimit: 10,
        xpReward: 60, // Max ~80 XP (15 correct * 2 + 100 score * 0.5)
        isNew: isNewQuiz(previousResults, quizId),
        questions: null,
        units: [unit],
        courseTitle: courseTitle,
        bestScore: getBestScore(previousResults, quizId),
        locked: isLocked,
      });

      // 3. REVISION QUIZ - Every 3 intermediate units (Units 3, 6, 9, etc.)
      if ((index + 1) % 3 === 0) {
        const revisionNumber = revisionCount + 1;
        const revisionQuizId = `quiz-revision-${revisionNumber}`;
        const revisionUnits = units.slice(0, index + 1); // Units 1 to current

        // Unlocks when Unit 3/6/9 completed with >= 50%
        const isRevisionLocked = !hasCompletedQuiz(quizId, 50);

        quizList.push({
          id: revisionQuizId,
          title: `Units 1-${index + 1} - Revision Challenge`,
          description: `Comprehensive review combining all concepts from the first ${
            index + 1
          } units.`,
          difficulty: "intermediate",
          questionCount: 20,
          timeLimit: 20,
          xpReward: 90, // Max ~90 XP (20 correct * 2 + 100 score * 0.5)
          isNew: isNewQuiz(previousResults, revisionQuizId),
          questions: null,
          units: revisionUnits,
          courseTitle: courseTitle,
          bestScore: getBestScore(previousResults, revisionQuizId),
          locked: isRevisionLocked,
          isRevision: true,
        });

        revisionCount++;

        // 4. SUPER REVISION QUIZ - Every 3 revision quizzes (after Revision 3, 6, 9, etc.)
        if (revisionNumber % 3 === 0) {
          const superRevisionNumber = Math.floor(revisionNumber / 3);
          const superRevisionQuizId = `quiz-super-revision-${superRevisionNumber}`;
          const superRevisionUnits = units.slice(0, index + 1); // All units up to this point

          // Unlocks automatically after Revision 3/6/9 (no score requirement)
          const isSuperRevisionLocked = !hasCompletedQuiz(revisionQuizId, 0); // Just needs completion

          quizList.push({
            id: superRevisionQuizId,
            title: `Units 1-${index + 1} - Super Revision`,
            description: `Comprehensive review covering all ${
              index + 1
            } units with intermediate-level questions.`,
            difficulty: "intermediate",
            questionCount: 20,
            timeLimit: 20,
            xpReward: 100, // Max ~90 XP but shows higher reward for prestige
            isNew: isNewQuiz(previousResults, superRevisionQuizId),
            questions: null,
            units: superRevisionUnits,
            courseTitle: courseTitle,
            bestScore: getBestScore(previousResults, superRevisionQuizId),
            locked: isSuperRevisionLocked,
            isSuperRevision: true,
          });
        }
      }
    }

    // 5. ADVANCED QUIZ - Frozen scope (units 1-N where N is first >= 70% intermediate)
    const advancedUnlockPoint = getAdvancedUnlockPoint();
    const advancedUnlocked = advancedUnlockPoint !== null;
    const advancedUnits = advancedUnlocked
      ? units.slice(0, advancedUnlockPoint)
      : [];

    quizList.push({
      id: `quiz-advanced-comprehensive`,
      title: `${courseTitle} - Advanced Challenge`,
      description: advancedUnlocked
        ? advancedUnlockPoint === 1
          ? `Harder questions testing your mastery of the first unit you studied.`
          : `Harder questions covering the first ${advancedUnlockPoint} units you studied.`
        : `Score 70%+ on any unit quiz to unlock this challenge.`,
      difficulty: "advanced",
      questionCount: 20,
      timeLimit: 25,
      xpReward: 120, // Max ~90 XP but shows higher for difficulty
      isNew: isNewQuiz(previousResults, `quiz-advanced-comprehensive`),
      questions: null,
      units: advancedUnits,
      courseTitle: courseTitle,
      bestScore: getBestScore(previousResults, `quiz-advanced-comprehensive`),
      locked: !advancedUnlocked,
    });

    // 6. EXPERT QUIZ - Same frozen scope as Advanced (requires >= 80% on Advanced)
    const expertUnlocked = hasCompletedQuiz("quiz-advanced-comprehensive", 80);
    const expertUnits = advancedUnits; // Same scope as Advanced

    quizList.push({
      id: `quiz-expert-mastery`,
      title: `${courseTitle} - Expert Mastery`,
      description: expertUnlocked
        ? advancedUnlockPoint === 1
          ? `Most challenging questions testing complete mastery of your first unit.`
          : `Most challenging questions across the first ${advancedUnlockPoint} units. Prove your expertise!`
        : `Score 80%+ on Advanced Challenge to unlock the ultimate test.`,
      difficulty: "expert",
      questionCount: 20,
      timeLimit: 25,
      xpReward: 150, // Max ~90 XP but shows highest reward for prestige
      isNew: isNewQuiz(previousResults, `quiz-expert-mastery`),
      questions: null,
      units: expertUnits,
      courseTitle: courseTitle,
      bestScore: getBestScore(previousResults, `quiz-expert-mastery`),
      locked: !expertUnlocked,
    });

    // Sort: Unlocked first, then locked
    const sorted = quizList.sort((a, b) => {
      if (a.locked === b.locked) return 0;
      return a.locked ? 1 : -1;
    });

    // Show only next 1 locked quiz + a summary card for the rest
    const unlockedQuizzes = sorted.filter((q) => !q.locked);
    const lockedQuizzes = sorted.filter((q) => q.locked);
    const visibleLockedQuizzes = lockedQuizzes.slice(0, 1);
    const hiddenLockedCount = lockedQuizzes.length - 1;

    const result = [...unlockedQuizzes, ...visibleLockedQuizzes];

    // Add metadata about hidden quizzes
    if (hiddenLockedCount > 0) {
      result.hiddenLockedCount = hiddenLockedCount;
      result.totalQuizzes = quizList.length;
      result.unlockedCount = unlockedQuizzes.length;
    }

    return result;
  };

  const getStudiedUnits = (units, subtopics) => {
    // Get units that have at least one viewed subtopic
    const studiedUnitIndices = new Set();

    subtopics.forEach((subtopic) => {
      if (subtopic.viewed && subtopic.unitIndex !== undefined) {
        studiedUnitIndices.add(subtopic.unitIndex);
      }
    });

    return Array.from(studiedUnitIndices)
      .sort((a, b) => a - b)
      .map((index) => units[index])
      .filter((unit) => unit !== undefined);
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
            timeLimit: getTimeLimit(difficulty, count), // Send time limit for security
            userId: user?.uid || "anonymous", // Track user for analytics
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
          `✅ Generated ${data.questions.length} questions from backend (secure)`
        );

        // Return questions with security metadata
        return {
          questions: data.questions,
          sessionId: data.sessionId,
          sessionHash: data.sessionHash,
          startTime: data.startTime,
          timeLimit: data.timeLimit,
        };
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
      return {
        questions: getFallbackQuestions(count, difficulty, courseTitle),
        sessionId: null,
        sessionHash: null,
        startTime: Date.now(),
        timeLimit: getTimeLimit(difficulty, count),
      };
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

  const hasCompletedQuiz = (results, quizId, minScore = 50) => {
    return results.some((r) => r.quizId === quizId && r.score >= minScore);
  };

  const hasCompletedDifficulty = (results, difficulty, minScore = 60) => {
    return results.some(
      (r) => r.difficulty === difficulty && r.score >= minScore
    );
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
    const quiz = quizzes[quizIndex];
    if (!quiz) return false;

    // Return locked property from quiz object
    return quiz.locked || false;
  };

  const handleStartQuiz = async (quiz) => {
    // If questions already generated with security data, use them
    if (quiz.questions && quiz.questions.length > 0 && quiz.sessionId) {
      setActiveQuiz(quiz);
      return;
    }

    // Otherwise, generate questions now with security
    console.log(`📝 Generating secure quiz: ${quiz.title}`);
    setLoading(true);

    try {
      const quizData = await generateQuestionsFromUnits(
        quiz.units,
        quiz.questionCount,
        quiz.difficulty,
        quiz.courseTitle
      );

      // Update quiz with generated questions and security metadata
      const updatedQuiz = {
        ...quiz,
        questions: quizData.questions,
        sessionId: quizData.sessionId,
        sessionHash: quizData.sessionHash,
        startTime: quizData.startTime,
        timeLimit: Math.floor(quizData.timeLimit / 60), // Convert seconds to minutes for display
      };
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
    if (!userStats) return 200;
    // Exponential progression: each level needs more XP
    return 200 + (userStats.level - 1) * 50;
  };

  const getXPProgress = () => {
    if (!userStats) return 0;

    // Simple: just show progress within current level
    const xpNeeded = getXPForNextLevel();
    const progress = Math.max(
      0,
      Math.min(100, (userStats.xp / xpNeeded) * 100)
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
    // More balanced XP calculation: base XP from score + bonus per correct answer
    const xpGained = Math.floor(
      quizResults.score * 0.5 + quizResults.correctAnswers * 2
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

              {/* Hidden Quizzes Summary Card - In Grid */}
              {quizzes.hiddenLockedCount > 0 && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex flex-col justify-between h-full min-h-[200px]">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          +{quizzes.hiddenLockedCount} More Quiz
                          {quizzes.hiddenLockedCount > 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">
                      Complete quizzes above to unlock more challenges
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                      <span className="text-gray-500 text-xs">Progress</span>
                      <span className="text-purple-400 text-sm font-medium">
                        {quizzes.unlockedCount || 0}/{quizzes.totalQuizzes}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Tips */}
        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-purple-400 font-medium text-sm mb-2">
                Quiz System Guide
              </h4>

              <div className="space-y-3 text-xs text-gray-400">
                <div>
                  <p className="text-white font-medium mb-1">📚 Quiz Types:</p>
                  <ul className="space-y-1 ml-4">
                    <li>
                      • <span className="text-green-400">Beginner</span> -
                      General overview of the entire course to test your prior
                      knowledge (10 questions, 5 min)
                    </li>
                    <li>
                      • <span className="text-yellow-400">Intermediate</span> -
                      Deep dive into a specific unit's concepts and applications
                      (15 questions, 10 min)
                    </li>
                    <li>
                      • <span className="text-blue-400">Revision</span> -
                      Comprehensive review combining all concepts from multiple
                      units (20 questions, 20 min)
                    </li>
                    <li>
                      • <span className="text-purple-400">Super Revision</span>{" "}
                      - Comprehensive review covering 9+ units with
                      intermediate-level questions (20 questions, 20 min)
                    </li>
                    <li>
                      • <span className="text-orange-400">Advanced</span> -
                      Harder questions testing mastery of the units you studied
                      (20 questions, 25 min)
                    </li>
                    <li>
                      • <span className="text-red-400">Expert</span> - Most
                      challenging questions proving complete expertise (20
                      questions, 25 min)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-white font-medium mb-1">
                    🔓 How to Unlock Quizzes:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>
                      • <span className="text-green-400">Beginner</span> →
                      Always available, no requirements
                    </li>
                    <li>
                      •{" "}
                      <span className="text-yellow-400">
                        Intermediate Unit 1
                      </span>{" "}
                      → Always available
                    </li>
                    <li>
                      •{" "}
                      <span className="text-yellow-400">
                        Intermediate Unit 2+
                      </span>{" "}
                      → Score 50%+ on the previous unit (e.g., Unit 2 needs Unit
                      1 ≥50%)
                    </li>
                    <li>
                      • <span className="text-blue-400">Revision Quiz</span> →
                      Unlocks every 3 units (after Units 3, 6, 9...) when you
                      complete that unit with 50%+
                    </li>
                    <li>
                      • <span className="text-purple-400">Super Revision</span>{" "}
                      → Unlocks every 3 revision quizzes (after Revision 3, 6,
                      9...) automatically
                    </li>
                    <li>
                      • <span className="text-orange-400">Advanced</span> →
                      Score 70%+ on ANY intermediate unit quiz
                    </li>
                    <li>
                      • <span className="text-red-400">Expert</span> → Score
                      80%+ on the Advanced Challenge
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-white font-medium mb-1">
                    📖 What Are Revision & Super Revision?
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>
                      • <span className="text-blue-400">Revision Quizzes</span>{" "}
                      help you review everything you've learned. They appear
                      after every 3 units (e.g., Revision 1 covers Units 1-3,
                      Revision 2 covers Units 1-6)
                    </li>
                    <li>
                      •{" "}
                      <span className="text-purple-400">
                        Super Revision Quizzes
                      </span>{" "}
                      are comprehensive reviews that unlock after 3 revision
                      quizzes. They test 9+ units with intermediate-level
                      questions to reinforce learning
                    </li>
                    <li>
                      • Both help reinforce your learning by combining concepts
                      across multiple topics
                    </li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-purple-500/20">
                  <p className="text-gray-500">
                    💡 <span className="text-purple-400">Tip:</span> You can
                    retry any quiz as many times as you want. Your best score is
                    always saved!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
