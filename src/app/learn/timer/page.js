"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Award,
  Sparkles,
  Coffee,
  Brain,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mode definitions
const MODES = {
  focus: {
    id: "focus",
    label: "Focus Session",
    duration: 25 * 60,
    color: "from-emerald-400 via-teal-400 to-cyan-500",
    glowColor: "rgba(20, 184, 166, 0.25)",
    accent: "text-teal-400",
    bgAccent: "bg-teal-500/10",
    borderAccent: "border-teal-500/20",
    tips: [
      "Keep your study goal simple and focus on a single concept.",
      "Clear your browser tabs—only keep open what you need.",
      "A clean physical desk leads to a clear mental workspace.",
      "Take deep, slow breaths if you feel stuck or distracted.",
    ]
  },
  shortBreak: {
    id: "shortBreak",
    label: "Short Break",
    duration: 5 * 60,
    color: "from-sky-400 via-blue-400 to-indigo-500",
    glowColor: "rgba(56, 189, 248, 0.25)",
    accent: "text-sky-400",
    bgAccent: "bg-sky-500/10",
    borderAccent: "border-sky-500/20",
    tips: [
      "Stand up, stretch your shoulders, and roll your neck.",
      "Look at something at least 20 feet away to rest your eyes.",
      "Hydrate. A quick glass of water boosts mental clarity.",
      "Take a step away from all screens for a true mental reset.",
    ]
  },
  longBreak: {
    id: "longBreak",
    label: "Long Break",
    duration: 15 * 60,
    color: "from-purple-400 via-fuchsia-400 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.25)",
    accent: "text-purple-400",
    bgAccent: "bg-purple-500/10",
    borderAccent: "border-purple-500/20",
    tips: [
      "Step outside for fresh air or do a quick physical walk.",
      "Prepare a healthy snack to refuel your body's glucose.",
      "Close your eyes completely and listen to some soft music.",
      "Write down any thoughts to clear your mental bandwidth.",
    ]
  }
};

export default function TimerPage() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showXpModal, setShowXpModal] = useState(false);
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);
  
  // Session stats state
  const [stats, setStats] = useState({
    completedSessions: 0,
    totalFocusSeconds: 0,
  });

  const timerRef = useRef(null);

  // Initialize stats and tasks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedStats = localStorage.getItem("acemind_timer_stats");
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          if (parsed.totalFocusMinutes !== undefined && parsed.totalFocusSeconds === undefined) {
            parsed.totalFocusSeconds = parsed.totalFocusMinutes * 60;
            delete parsed.totalFocusMinutes;
          }
          setStats(parsed);
        }
        
        const savedTasks = localStorage.getItem("acemind_timer_tasks");
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks);
          const active = parsedTasks.find(t => !t.completed);
          if (active) setActiveTaskId(active.id);
        } else {
          // Standard defaults
          const defaultTasks = [
            { id: 1, text: "Read current study module", completed: false },
            { id: 2, text: "Solve practice questions", completed: false },
          ];
          setTasks(defaultTasks);
          setActiveTaskId(1);
        }
      } catch (err) {
        console.error("Failed to load local storage timer data:", err);
      }
    }
  }, []);

  // Sync tasks to localStorage
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem("acemind_timer_tasks", JSON.stringify(newTasks));
    }
  };

  // Sync stats to localStorage
  const saveStats = (newStats) => {
    setStats(newStats);
    if (typeof window !== "undefined") {
      localStorage.setItem("acemind_timer_stats", JSON.stringify(newStats));
    }
  };

  // Premium synth chime sound using Web Audio API
  const playAlertSound = (type = "complete") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      
      if (type === "complete") {
        // High quality dual tone chime with gain envelope
        const playChimeNode = (freq, startOffset, duration) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime + startOffset);
          gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startOffset + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
          
          osc.start(ctx.currentTime + startOffset);
          osc.stop(ctx.currentTime + startOffset + duration);
        };
        
        // Beautiful musical interval (fifth: E5 -> B5)
        playChimeNode(659.25, 0, 0.6); // E5
        playChimeNode(987.77, 0.12, 0.8); // B5
      } else if (type === "click") {
        // Subtle transient click
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.warn("Audio Context playback failed:", e);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          // Increment focus seconds in real-time as the timer ticks
          if (activeMode === "focus") {
            setStats((currentStats) => {
              const updatedStats = {
                ...currentStats,
                totalFocusSeconds: (currentStats.totalFocusSeconds || 0) + 1,
              };
              if (typeof window !== "undefined") {
                localStorage.setItem("acemind_timer_stats", JSON.stringify(updatedStats));
              }
              return updatedStats;
            });
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, activeMode]);

  // Handle mode switches
  const handleModeChange = (modeId) => {
    setIsRunning(false);
    setActiveMode(modeId);
    setTimeLeft(MODES[modeId].duration);
    playAlertSound("click");
  };

  // Start/Pause toggle
  const toggleTimer = () => {
    setIsRunning(!isRunning);
    playAlertSound("click");
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[activeMode].duration);
    playAlertSound("click");
  };

  // Timer complete event
  const handleTimerComplete = () => {
    setIsRunning(false);
    playAlertSound("complete");
    
    if (activeMode === "focus") {
      const newStats = {
        ...stats,
        completedSessions: stats.completedSessions + 1,
      };
      saveStats(newStats);
      setShowXpModal(true);
    } else {
      setTimeLeft(MODES[activeMode].duration);
    }
  };

  // Tasks actions
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
    };
    
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setNewTaskText("");
    
    if (activeTaskId === null) {
      setActiveTaskId(newTask.id);
    }
    playAlertSound("click");
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
    
    if (id === activeTaskId) {
      const nextIncomplete = updated.find(t => !t.completed);
      setActiveTaskId(nextIncomplete ? nextIncomplete.id : null);
    }
    playAlertSound("click");
  };

  const handleDeleteTask = (id, e) => {
    e.stopPropagation();
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    
    if (id === activeTaskId) {
      const nextIncomplete = updated.find(t => !t.completed);
      setActiveTaskId(nextIncomplete ? nextIncomplete.id : null);
    }
    playAlertSound("click");
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format concentration time dynamically
  const formatFocusTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const currentMode = MODES[activeMode];
  const progress = (timeLeft / currentMode.duration);
  const strokeDashoffset = 2 * Math.PI * 110 * (1 - progress); // radius = 110

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <ProtectedRoute requireAuth={true}>
      <Sidebar>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-5 mb-8 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-inner">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl tracking-tight">Focus Space</h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Maximize your study flow state using distraction-free Pomodoro technique.
                </p>
              </div>
            </div>

            {/* Quick stats and sound control */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 bg-gray-850 border border-gray-750 hover:border-gray-600 rounded-xl text-gray-400 hover:text-white transition-all shadow-md"
                title={soundEnabled ? "Mute chimes" : "Unmute chimes"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <div className="bg-gray-850 border border-gray-750/80 px-4 py-2 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Concentration</p>
                  <p className="text-sm font-extrabold text-white">
                    {formatFocusTime(stats.totalFocusSeconds || 0)} / {tasks.filter((t) => t.completed).length} tasks completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
            
            {/* Left Column: Premium Interactive Timer */}
            <div className="lg:col-span-7 bg-gray-850/40 border border-gray-800/80 rounded-3xl p-6 sm:p-10 flex flex-col items-center shadow-xl backdrop-blur-md relative overflow-hidden">
              
              {/* Subtle radial backdrop ambient light */}
              <div 
                className="absolute w-80 h-80 rounded-full blur-[100px] -z-10 opacity-30 transition-all duration-1000"
                style={{
                  background: isRunning ? `radial-gradient(circle, ${currentMode.glowColor} 0%, transparent 70%)` : "none",
                  top: "20%",
                  left: "25%",
                }}
              />

              {/* Mode Tabs Selector */}
              <div className="flex gap-1.5 p-1 bg-gray-900/60 border border-gray-800 rounded-2xl mb-10 w-full max-w-md shadow-inner">
                {Object.values(MODES).map((mode) => {
                  const isSelected = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`relative flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? `bg-gradient-to-r ${mode.color} text-gray-950 font-black shadow-lg shadow-teal-500/5`
                          : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                      }`}
                    >
                      {mode.id === "focus" ? (
                        <Brain className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      ) : (
                        <Coffee className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      )}
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Premium Circular SVG Timer */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-10 select-none">
                
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  {/* Backdrop Shadow Ring */}
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    className="stroke-gray-900"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Inactive Ambient Track */}
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    className="stroke-gray-800/60"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active Gradient Glowing Progress */}
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="110"
                    className="stroke-current transition-colors duration-500"
                    strokeWidth="9"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 110}
                    animate={{ strokeDashoffset }}
                    transition={{ ease: "linear", duration: 0.3 }}
                    style={{
                      stroke: `url(#g-${currentMode.id})`,
                      filter: isRunning ? `drop-shadow(0px 0px 8px ${currentMode.glowColor})` : "none"
                    }}
                  />
                  
                  {/* SVG Gradients definition */}
                  <defs>
                    <linearGradient id="g-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="50%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="g-shortBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="g-longBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Central Time & Active State */}
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl font-black tracking-tighter font-mono text-white mb-2 leading-none">
                    {formatTime(timeLeft)}
                  </span>
                  
                  <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${currentMode.accent} ${currentMode.bgAccent} border ${currentMode.borderAccent} shadow-sm transition-all duration-500`}>
                    {isRunning ? "Running Session" : "Session Paused"}
                  </div>
                  
                  {activeMode === "focus" && activeTask && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-gray-400 text-xs mt-4 max-w-[200px] truncate font-semibold flex items-center gap-1.5 justify-center" 
                      title={activeTask.text}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      {activeTask.text}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5">
                <button
                  onClick={resetTimer}
                  className="p-3.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl hover:text-white transition-all text-gray-500 group shadow-md hover:scale-105 active:scale-95"
                  title="Reset countdown"
                >
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
                </button>

                <button
                  onClick={toggleTimer}
                  className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-r ${currentMode.color} text-gray-950`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span className="tracking-wide">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span className="tracking-wide">Start Focus</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Column: Study Objectives & AI Coach */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Task Checklist Panel */}
              <div className="bg-gray-850/40 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-4 mb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>📋</span> Session Tasks
                  </h3>
                  <span className="text-xs text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.completed).length} / {tasks.length} Complete
                  </span>
                </div>

                {/* Add Task Input */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Enter study task objective..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-gray-950 font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto max-h-56 space-y-2.5 pr-1 custom-scrollbar">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center justify-center h-full">
                      <span className="text-3xl mb-2">📌</span>
                      <p className="font-semibold text-gray-400">Tasklist is empty</p>
                      <p className="text-xs text-gray-600 mt-1">Add session objectives to stay on target.</p>
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const isActive = activeTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          onClick={() => !task.completed && setActiveTaskId(task.id)}
                          className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            task.completed
                              ? "bg-gray-900/20 border-gray-900/30 opacity-40"
                              : isActive
                              ? "bg-teal-500/5 border-teal-500/30 hover:border-teal-500/40"
                              : "bg-gray-900/40 border-gray-800/80 hover:border-gray-700/80"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTask(task.id);
                              }}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                task.completed
                                  ? "bg-teal-500 border-teal-500 text-gray-950"
                                  : "border-gray-700 hover:border-teal-500"
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                            </button>
                            
                            <span className={`text-sm font-medium truncate ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                              {task.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isActive && !task.completed && (
                              <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-wider">
                                Active
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Study Tips Panel */}
              <div className="bg-gray-850/40 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-white font-bold text-lg flex items-center gap-2 border-b border-gray-800/60 pb-4 mb-4">
                  <Sparkles className={`w-5 h-5 ${currentMode.accent}`} />
                  <span>Session Coach</span>
                </h3>
                
                <div className="space-y-3">
                  {currentMode.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${currentMode.accent} bg-current`} />
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Gamified Celebration XP Modal */}
          <AnimatePresence>
            {showXpModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md"
                  onClick={() => setShowXpModal(false)}
                />

                {/* Modal box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="bg-gray-850 border border-teal-500/20 rounded-3xl p-8 max-w-md w-full text-center relative z-10 shadow-2xl flex flex-col items-center"
                >
                  <div className="absolute top-0 transform -translate-y-1/2 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

                  {/* Celebration Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/10 mb-6">
                    <Award className="w-8 h-8 text-gray-950" />
                  </div>

                  <h3 className="text-white font-extrabold text-2xl tracking-tight mb-2">Focus Block Complete!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Excellent work. You completed your 25-minute Pomodoro study block. Keep up the consistency!
                  </p>

                  {/* XP Reward Badge */}
                  <div className="bg-teal-500/10 border border-teal-500/20 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-6 w-full">
                    <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                    <span className="text-teal-400 font-extrabold text-lg tracking-wider">+25 XP AWARDED</span>
                  </div>

                  <p className="text-gray-500 text-xs mb-8">
                    Your focus statistics have been synchronized locally. Take a short 5-minute break now!
                  </p>

                  <button
                    onClick={() => {
                      setShowXpModal(false);
                      handleModeChange("shortBreak");
                    }}
                    className="w-full py-4 bg-gradient-to-r from-teal-400 to-cyan-500 text-gray-950 font-black rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Start Short Break ☕
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
