"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  createFlashcardDeck,
  getChats,
  getFlashcardDeck,
  getUserFlashcardDecks,
  reviewFlashcard,
} from "@/lib/db";
import { Brain, RotateCcw, Sparkles, Layers, CheckCircle2 } from "lucide-react";

function buildCourseContext(chat) {
  const units = chat?.aiResponse?.units || [];
  const summary = units
    .map((unit, index) => {
      const title = unit?.unit_title || `Unit ${index + 1}`;
      const subTopics = Array.isArray(unit?.sub_topics)
        ? unit.sub_topics.slice(0, 10).join(", ")
        : "";
      return `${title}: ${subTopics}`;
    })
    .join("\n");

  return `${chat?.syllabusContext || ""}\n${summary}`.slice(0, 4000);
}

function isCardDue(card) {
  if (!card?.dueDate) return true;
  return new Date(card.dueDate).getTime() <= Date.now();
}

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [chats, setChats] = useState([]);
  const [decks, setDecks] = useState([]);

  const [selectedChatId, setSelectedChatId] = useState("");
  const [cardCount, setCardCount] = useState(20);

  const [activeDeck, setActiveDeck] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError("");

    try {
      const [chatsResult, decksResult] = await Promise.all([
        getChats(user.uid),
        getUserFlashcardDecks(user.uid),
      ]);

      if (chatsResult.success) {
        const sortedChats = [...chatsResult.chats].sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
        );
        setChats(sortedChats);
        if (!selectedChatId && sortedChats.length > 0) {
          setSelectedChatId(sortedChats[0].chatId);
        }
      }

      if (decksResult.success) {
        setDecks(decksResult.data);
      }
    } catch (loadError) {
      console.error("Error loading flashcard data:", loadError);
      setError("Failed to load flashcard data");
    } finally {
      setLoading(false);
    }
  }, [selectedChatId, user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [authLoading, user, router, loadData]);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.chatId === selectedChatId),
    [chats, selectedChatId],
  );

  const currentCard = reviewQueue[currentIndex] || null;

  const clearAlertsSoon = () => {
    window.setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3500);
  };

  const handleGenerateDeck = async () => {
    if (!selectedChat) {
      setError("Please select a course first");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/api/generate-flashcards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic:
              selectedChat?.aiResponse?.courseTitle ||
              selectedChat?.topic ||
              "Course",
            courseContext: buildCourseContext(selectedChat),
            cardCount,
            userId: user.uid,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(data?.message || "Flashcard generation failed");
        return;
      }

      const deckResult = await createFlashcardDeck(user.uid, {
        title: `${
          selectedChat?.aiResponse?.courseTitle ||
          selectedChat?.topic ||
          "Course"
        } - Smart Deck`,
        chatId: selectedChat.chatId,
        source: "ai",
        cards: data.cards,
      });

      if (!deckResult.success) {
        setError(deckResult.message || "Could not save deck");
        return;
      }

      setSuccess(`Created deck with ${data.cards.length} cards`);
      await loadData();
      clearAlertsSoon();
    } catch (generationError) {
      console.error("Generate deck error:", generationError);
      setError("Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const handleStartReview = async (deckId) => {
    setError("");
    setSuccess("");

    const result = await getFlashcardDeck(deckId, user.uid);
    if (!result.success) {
      setError(result.message || "Could not open deck");
      return;
    }

    const dueCards = (result.data.cards || []).filter(isCardDue);
    if (dueCards.length === 0) {
      setError("No cards due right now. Try again later.");
      clearAlertsSoon();
      return;
    }

    setActiveDeck(result.data);
    setReviewQueue(dueCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionDone(false);
  };

  const handleReview = async (rating) => {
    if (!activeDeck || !currentCard) return;

    const result = await reviewFlashcard(
      activeDeck.deckId,
      user.uid,
      currentCard.id,
      rating,
    );
    if (!result.success) {
      setError(result.message || "Failed to save card review");
      return;
    }

    const isLastCard = currentIndex >= reviewQueue.length - 1;
    if (isLastCard) {
      setSessionDone(true);
      setSuccess("Review session completed");
      await loadData();
      clearAlertsSoon();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setShowAnswer(false);
  };

  const resetReviewSession = () => {
    setActiveDeck(null);
    setReviewQueue([]);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionDone(false);
  };

  if (loading || authLoading) {
    return (
      <Sidebar>
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Brain className="w-7 h-7 text-yellow-400" />
              Smart Flashcards
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              AI-generated decks with spaced repetition scheduling.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-100 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-900/40 border border-green-500 text-green-100 text-sm">
              {success}
            </div>
          )}

          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 md:p-5 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Generate New Deck
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Course</label>
                <select
                  value={selectedChatId}
                  onChange={(e) => setSelectedChatId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                >
                  {chats.length === 0 ? (
                    <option value="">No courses found</option>
                  ) : (
                    chats.map((chat) => (
                      <option key={chat.chatId} value={chat.chatId}>
                        {chat?.aiResponse?.courseTitle ||
                          chat?.topic ||
                          "Untitled Course"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Card Count</label>
                <input
                  type="number"
                  min={5}
                  max={40}
                  value={cardCount}
                  onChange={(e) =>
                    setCardCount(
                      Math.max(5, Math.min(40, Number(e.target.value) || 5)),
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateDeck}
              disabled={generating || chats.length === 0}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "Generate Smart Deck"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Your Decks ({decks.length})
              </h3>

              {decks.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Generate your first deck to begin revision.
                </p>
              )}

              {decks.map((deck) => (
                <div
                  key={deck.deckId}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-100">
                      {deck.title}
                    </p>
                    <span className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-300">
                      Due {deck.dueCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {deck.totalCards} cards
                  </p>
                  <button
                    onClick={() => handleStartReview(deck.deckId)}
                    className="px-3 py-1.5 text-xs rounded-md bg-blue-600 hover:bg-blue-700"
                  >
                    Start Review
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4 min-h-[320px]">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                Review Session
              </h3>

              {!activeDeck && !sessionDone && (
                <p className="text-gray-400 text-sm">
                  Choose a deck and start review to practice due cards.
                </p>
              )}

              {activeDeck && currentCard && !sessionDone && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 flex items-center justify-between">
                    <span>{activeDeck.title}</span>
                    <span>
                      Card {currentIndex + 1} / {reviewQueue.length}
                    </span>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Front
                    </p>
                    <p className="text-sm md:text-base text-gray-100">
                      {currentCard.front}
                    </p>
                  </div>

                  {showAnswer ? (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 space-y-3">
                      <p className="text-xs uppercase tracking-wide text-green-400">
                        Back
                      </p>
                      <p className="text-sm md:text-base text-green-100">
                        {currentCard.back}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => handleReview(0)}
                          className="px-3 py-2 text-xs rounded-md bg-red-600 hover:bg-red-700"
                        >
                          Again
                        </button>
                        <button
                          onClick={() => handleReview(3)}
                          className="px-3 py-2 text-xs rounded-md bg-orange-600 hover:bg-orange-700"
                        >
                          Hard
                        </button>
                        <button
                          onClick={() => handleReview(4)}
                          className="px-3 py-2 text-xs rounded-md bg-blue-600 hover:bg-blue-700"
                        >
                          Good
                        </button>
                        <button
                          onClick={() => handleReview(5)}
                          className="px-3 py-2 text-xs rounded-md bg-green-600 hover:bg-green-700"
                        >
                          Easy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-sm"
                    >
                      Show Answer
                    </button>
                  )}

                  <button
                    onClick={resetReviewSession}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
                  >
                    End Session
                  </button>
                </div>
              )}

              {sessionDone && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 space-y-3">
                  <p className="text-green-200 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Session Complete
                  </p>
                  <p className="text-sm text-green-100">
                    Great work. Your spaced repetition schedule has been
                    updated.
                  </p>
                  <button
                    onClick={resetReviewSession}
                    className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-sm"
                  >
                    Back to Decks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
