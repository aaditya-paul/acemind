"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

const QuizInterface = ({ quiz, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert minutes to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused && !showResults && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, showResults, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const toggleFlag = (questionIndex) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeTaken = quiz.timeLimit * 60 - timeLeft;
    let correctCount = 0;
    const mistakes = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      } else {
        mistakes.push({
          questionIndex: index,
          question: question.question,
          userAnswer:
            userAnswer !== undefined
              ? question.options[userAnswer]
              : "Not answered",
          correctAnswer: question.options[question.correctAnswer],
          explanation: question.explanation || "",
        });
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    const results = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: quiz.questions.length - correctCount,
      score,
      timeTaken,
      timeLimit: quiz.timeLimit * 60,
      mistakes,
      answers,
      flaggedQuestions: Array.from(flaggedQuestions),
    };

    setShowResults(true);
    onComplete(results);
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (quiz.timeLimit * 60)) * 100;
    if (percentage > 50) return "text-green-400";
    if (percentage > 25) return "text-yellow-400";
    return "text-red-400 animate-pulse";
  };

  if (showResults) {
    return null; // Results will be shown by parent component
  }

  const question = quiz.questions[currentQuestion];
  const progressPercentage =
    ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">{quiz.title}</h2>
                <p className="text-gray-400 text-sm">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 ${getTimeColor()}`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-bold text-lg">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Pause/Play */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {isPaused ? (
                    <Play className="w-5 h-5 text-green-400" />
                  ) : (
                    <Pause className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="text-gray-400">
                Answered:{" "}
                <span className="text-white font-bold">{answeredCount}</span>/
                {quiz.questions.length}
              </div>
              <div className="text-gray-400">
                Flagged:{" "}
                <span className="text-yellow-400 font-bold">
                  {flaggedQuestions.size}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-6 md:p-8 shadow-xl">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-gray-900 font-bold">
                      {currentQuestion + 1}
                    </div>
                    <h3 className="text-white text-xl font-semibold">
                      {question.question}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                    flaggedQuestions.has(currentQuestion)
                      ? "bg-yellow-500/20 border border-yellow-500"
                      : "bg-gray-700/50 border border-gray-600 hover:border-yellow-500/50"
                  }`}
                >
                  <Flag
                    className={`w-5 h-5 ${
                      flaggedQuestions.has(currentQuestion)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(currentQuestion, index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20"
                          : "bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-yellow-500 bg-yellow-500"
                              : "border-gray-600"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 aspect-square bg-gray-900 rounded-full" />
                          )}
                        </div>
                        <span
                          className={`text-base ${
                            isSelected
                              ? "text-white font-medium"
                              : "text-gray-300"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-gray-700 text-white font-medium transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={onExit}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/50 text-red-400 font-medium transition-all"
            >
              Exit Quiz
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-bold transition-all shadow-lg shadow-green-500/20"
              >
                Submit Quiz
                <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(quiz.questions.length - 1, prev + 1)
                  )
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-gray-900 font-bold transition-all shadow-lg shadow-yellow-500/20"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Grid (Quick Navigation) */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">
              Quick Navigation
            </h4>
            <div className="grid grid-cols-10 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                    index === currentQuestion
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 shadow-lg"
                      : answers[index] !== undefined
                      ? "bg-green-500/20 border border-green-500 text-green-400"
                      : flaggedQuestions.has(index)
                      ? "bg-yellow-500/20 border border-yellow-500 text-yellow-400"
                      : "bg-gray-700/50 border border-gray-600 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
