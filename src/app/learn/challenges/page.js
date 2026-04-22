"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import QuizInterface from "@/components/QuizInterface";
import QuizResults from "@/components/QuizResults";
import {
  cancelDuelChallenge,
  createDuelChallenge,
  findUserByEmail,
  getChats,
  getDuelLeaderboard,
  getUserDuelChallenges,
  respondToDuelChallenge,
  submitDuelAttempt,
} from "@/lib/db";
import {
  Swords,
  Trophy,
  UserPlus,
  Clock,
  Target,
  Users,
  Flame,
  Medal,
} from "lucide-react";

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

function getTimeLimit(difficulty, questionCount) {
  const timePerQuestion = {
    beginner: 30,
    intermediate: 40,
    advanced: 75,
    expert: 80,
  };

  const secondsPerQuestion = timePerQuestion[difficulty] || 60;
  return Math.ceil(questionCount * secondsPerQuestion);
}

function buildCourseContext(chat) {
  const units = chat?.aiResponse?.units || [];
  const unitsContext = units
    .map((unit, index) => {
      const title = unit?.unit_title || `Unit ${index + 1}`;
      const subTopics = Array.isArray(unit?.sub_topics)
        ? unit.sub_topics.slice(0, 10).join(", ")
        : "";
      return `${title}: ${subTopics}`;
    })
    .join("\n");

  return `${chat?.syllabusContext || ""}\n${unitsContext}`.slice(0, 4000);
}

function getDuelOutcomeLabel(duel, uid) {
  if (duel.status !== "completed") return "In Progress";
  if (duel.isDraw) return "Draw";
  if (duel.winnerId === uid) return "You Won";
  return "You Lost";
}

export default function ChallengesPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [chats, setChats] = useState([]);
  const [duels, setDuels] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myChallengeStats, setMyChallengeStats] = useState(null);

  const [opponentEmail, setOpponentEmail] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(12);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [latestResult, setLatestResult] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError("");

    try {
      const [chatsResult, duelsResult, leaderboardResult] = await Promise.all([
        getChats(user.uid),
        getUserDuelChallenges(user.uid),
        getDuelLeaderboard(user.uid, 25),
      ]);

      if (chatsResult.success) {
        const sortedChats = [...chatsResult.chats].sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );
        setChats(sortedChats);
        if (!selectedChatId && sortedChats.length > 0) {
          setSelectedChatId(sortedChats[0].chatId);
        }
      }

      if (duelsResult.success) {
        setDuels(duelsResult.data);
      }

      if (leaderboardResult.success) {
        setLeaderboard(leaderboardResult.data.leaderboard || []);
        setMyChallengeStats(leaderboardResult.data.currentUserStats || null);
      }
    } catch (loadError) {
      console.error("Error loading challenges data:", loadError);
      setError("Failed to load challenge data");
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
    [chats, selectedChatId]
  );

  const incomingChallenges = useMemo(
    () =>
      duels.filter(
        (duel) => duel.status === "pending" && duel.opponentId === user?.uid
      ),
    [duels, user?.uid]
  );

  const sentChallenges = useMemo(
    () =>
      duels.filter(
        (duel) => duel.status === "pending" && duel.challengerId === user?.uid
      ),
    [duels, user?.uid]
  );

  const activeChallenges = useMemo(
    () => duels.filter((duel) => duel.status === "active"),
    [duels]
  );

  const completedChallenges = useMemo(
    () => duels.filter((duel) => duel.status === "completed"),
    [duels]
  );

  const clearAlertsSoon = () => {
    window.setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();

    if (!selectedChat) {
      setError("Please select a course before creating a challenge");
      return;
    }

    if (!opponentEmail.trim()) {
      setError("Friend email is required");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const friendResult = await findUserByEmail(opponentEmail);
      if (!friendResult.success) {
        setError(friendResult.message || "Friend not found");
        return;
      }

      const friend = friendResult.data;
      if (friend.uid === user.uid) {
        setError("You cannot challenge yourself");
        return;
      }

      const context = buildCourseContext(selectedChat);
      const duration = getTimeLimit(difficulty, questionCount);

      const createResult = await createDuelChallenge({
        challengerId: user.uid,
        challengerName:
          userData?.displayName || user.displayName || userData?.firstName || "You",
        challengerEmail: user.email,
        opponentId: friend.uid,
        opponentName: friend.displayName,
        opponentEmail: friend.email,
        chatId: selectedChat.chatId,
        courseTitle:
          selectedChat?.aiResponse?.courseTitle || selectedChat?.topic || "Course",
        courseContext: context,
        difficulty,
        questionCount,
        timeLimit: duration,
      });

      if (!createResult.success) {
        setError(createResult.message || "Could not create challenge");
        return;
      }

      setSuccess(`Challenge sent to ${friend.displayName}`);
      setOpponentEmail("");
      await loadData();
      clearAlertsSoon();
    } catch (createError) {
      console.error("Create challenge error:", createError);
      setError("Failed to create challenge");
    } finally {
      setCreating(false);
    }
  };

  const handleRespond = async (duelId, action) => {
    setError("");
    setSuccess("");

    const result = await respondToDuelChallenge(duelId, user.uid, action);
    if (!result.success) {
      setError(result.message || "Failed to respond to challenge");
      return;
    }

    if (action === "accept") {
      try {
        await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "/api/duel/prepare-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duelId,
            userId: user.uid,
            prepareOnly: true,
          }),
        });
      } catch (prepareError) {
        console.warn("Could not pre-prepare duel quiz:", prepareError);
      }
    }

    setSuccess(action === "accept" ? "Challenge accepted" : "Challenge declined");
    await loadData();
    clearAlertsSoon();
  };

  const handleCancel = async (duelId) => {
    const result = await cancelDuelChallenge(duelId, user.uid);
    if (!result.success) {
      setError(result.message || "Failed to cancel challenge");
      return;
    }

    setSuccess("Challenge cancelled");
    await loadData();
    clearAlertsSoon();
  };

  const handleStartDuel = async (duel) => {
    setError("");
    setSuccess("");

    if (duel?.attempts?.[user.uid]) {
      setError("You have already submitted your attempt for this duel");
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/api/duel/prepare-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duelId: duel.duelId,
            userId: user.uid,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(data?.message || "Failed to prepare duel quiz");
        return;
      }

      setActiveQuiz({
        duel,
        quiz: {
          id: duel.duelId,
          title: `${duel?.course?.title || "Course"} - Duel`,
          difficulty: duel?.quizConfig?.difficulty || "intermediate",
          questions: data.questions,
          sessionId: data.sessionId,
          sessionHash: data.sessionHash,
          startTime: data.startTime,
          timeLimit: data.timeLimit,
        },
      });
    } catch (quizError) {
      console.error("Error starting duel:", quizError);
      setError("Could not start duel quiz");
    }
  };

  const handleCompleteDuel = async (result) => {
    if (!activeQuiz?.duel?.duelId) return;

    const submitResult = await submitDuelAttempt(activeQuiz.duel.duelId, user.uid, result);
    if (!submitResult.success) {
      setError(submitResult.message || "Failed to submit duel attempt");
      setActiveQuiz(null);
      return;
    }

    setLatestResult(result);
    setActiveQuiz(null);
    setSuccess("Duel attempt submitted successfully");
    await loadData();
    clearAlertsSoon();
  };

  if (activeQuiz) {
    return (
      <QuizInterface
        quiz={activeQuiz.quiz}
        onComplete={handleCompleteDuel}
        onExit={() => setActiveQuiz(null)}
        userId={user?.uid}
      />
    );
  }

  if (latestResult) {
    return (
      <QuizResults
        results={latestResult}
        onRetake={() => setLatestResult(null)}
        onExit={() => setLatestResult(null)}
      />
    );
  }

  if (loading || authLoading) {
    return (
      <Sidebar>
        <div className="h-full min-h-[60vh] bg-gray-900 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="min-h-full bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Swords className="w-7 h-7 text-purple-400" />
                Challenge Mode
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                One-on-one quiz duels with your friends.
              </p>
            </div>
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

          <form
            onSubmit={handleCreateChallenge}
            className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 md:p-5 space-y-4"
          >
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Create New Duel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Friend Email</label>
                <input
                  type="email"
                  value={opponentEmail}
                  onChange={(e) => setOpponentEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Course</label>
                <select
                  value={selectedChatId}
                  onChange={(e) => setSelectedChatId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {chats.length === 0 ? (
                    <option value="">No courses found</option>
                  ) : (
                    chats.map((chat) => (
                      <option key={chat.chatId} value={chat.chatId}>
                        {chat?.aiResponse?.courseTitle || chat?.topic || "Untitled Course"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {DIFFICULTIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Questions</label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(5, Math.min(30, Number(e.target.value) || 5))
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Estimated time: {Math.ceil(getTimeLimit(difficulty, questionCount) / 60)} min
              </div>
              <button
                type="submit"
                disabled={creating || chats.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
              >
                {creating ? "Sending..." : "Send Challenge"}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Total Duels
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {myChallengeStats?.totalDuels || 0}
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Win Rate
              </p>
              <p className="text-2xl font-bold text-green-300 mt-1">
                {myChallengeStats?.winRate || 0}%
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" /> Current Streak
              </p>
              <p className="text-2xl font-bold text-orange-300 mt-1">
                {myChallengeStats?.currentWinStreak || 0}
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-1">
                <Medal className="w-4 h-4 text-yellow-400" /> Best Streak
              </p>
              <p className="text-2xl font-bold text-yellow-300 mt-1">
                {myChallengeStats?.bestWinStreak || 0}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3 overflow-x-auto">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Challenge Leaderboard
            </h3>

            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-400">No completed duel stats yet.</p>
            ) : (
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Player</th>
                    <th className="py-2 pr-2">Points</th>
                    <th className="py-2 pr-2">W-L-D</th>
                    <th className="py-2 pr-2">Win Rate</th>
                    <th className="py-2 pr-2">Streak</th>
                    <th className="py-2 pr-2">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 10).map((entry) => (
                    <tr
                      key={entry.uid}
                      className={`border-b border-gray-800 ${
                        entry.uid === user.uid ? "bg-purple-500/10" : ""
                      }`}
                    >
                      <td className="py-2 pr-2 font-semibold text-yellow-300">
                        {entry.rank}
                      </td>
                      <td className="py-2 pr-2 text-white">
                        {entry.displayName || "Anonymous User"}
                        {entry.uid === user.uid ? " (You)" : ""}
                      </td>
                      <td className="py-2 pr-2 text-blue-300">{entry.points}</td>
                      <td className="py-2 pr-2 text-gray-200">
                        {entry.wins}-{entry.losses}-{entry.draws}
                      </td>
                      <td className="py-2 pr-2 text-green-300">{entry.winRate}%</td>
                      <td className="py-2 pr-2 text-orange-300">{entry.currentWinStreak}</td>
                      <td className="py-2 pr-2 text-gray-200">{entry.averageScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                Incoming Challenges ({incomingChallenges.length})
              </h3>

              {incomingChallenges.length === 0 && (
                <p className="text-gray-400 text-sm">No incoming challenges.</p>
              )}

              {incomingChallenges.map((duel) => (
                <div key={duel.duelId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-gray-200">
                    <span className="text-purple-300 font-medium">{duel.challengerName}</span>{" "}
                    challenged you in <span className="font-medium">{duel?.course?.title}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {duel?.quizConfig?.difficulty} • {duel?.quizConfig?.questionCount} questions
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(duel.duelId, "accept")}
                      className="px-3 py-1.5 text-xs rounded-md bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(duel.duelId, "decline")}
                      className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Sent Challenges ({sentChallenges.length})
              </h3>

              {sentChallenges.length === 0 && (
                <p className="text-gray-400 text-sm">No pending challenges sent.</p>
              )}

              {sentChallenges.map((duel) => (
                <div key={duel.duelId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-gray-200">
                    Waiting for <span className="text-blue-300 font-medium">{duel.opponentName}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {duel?.course?.title} • {duel?.quizConfig?.difficulty}
                  </p>
                  <button
                    onClick={() => handleCancel(duel.duelId)}
                    className="px-3 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-purple-400" />
              Active Duels ({activeChallenges.length})
            </h3>

            {activeChallenges.length === 0 && (
              <p className="text-gray-400 text-sm">No active duels right now.</p>
            )}

            {activeChallenges.map((duel) => {
              const myAttempt = duel?.attempts?.[user.uid];
              const opponentId =
                duel.challengerId === user.uid ? duel.opponentId : duel.challengerId;
              const opponentAttempt = duel?.attempts?.[opponentId];

              return (
                <div key={duel.duelId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-gray-200 font-medium">{duel?.course?.title}</p>
                    <p className="text-xs text-gray-400">
                      {duel?.quizConfig?.difficulty} • {duel?.quizConfig?.questionCount} questions
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 rounded-md p-2">
                      <p className="text-gray-400">Your status</p>
                      <p className="text-white font-medium">
                        {myAttempt ? `Submitted (${myAttempt.score}%)` : "Not attempted"}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-md p-2">
                      <p className="text-gray-400">Opponent status</p>
                      <p className="text-white font-medium">
                        {opponentAttempt
                          ? `Submitted (${opponentAttempt.score}%)`
                          : "Waiting"}
                      </p>
                    </div>
                  </div>

                  {!myAttempt ? (
                    <button
                      onClick={() => handleStartDuel(duel)}
                      className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-sm font-medium"
                    >
                      Start Duel Quiz
                    </button>
                  ) : (
                    <p className="text-xs text-green-300">Attempt already submitted.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Completed Duels ({completedChallenges.length})
            </h3>

            {completedChallenges.length === 0 && (
              <p className="text-gray-400 text-sm">No completed duels yet.</p>
            )}

            {completedChallenges.map((duel) => (
              <div key={duel.duelId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-200 font-medium">{duel?.course?.title}</p>
                  <span className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-300">
                    {getDuelOutcomeLabel(duel, user.uid)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {duel.challengerName}: {duel?.attempts?.[duel.challengerId]?.score ?? "-"}% • {" "}
                  {duel.opponentName}: {duel?.attempts?.[duel.opponentId]?.score ?? "-"}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
