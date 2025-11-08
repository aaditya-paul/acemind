"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  // Smooth scroll to section with offset for fixed nav
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of fixed nav (h-16 = 64px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: {
      scale: 0.98,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const features = [
    {
      icon: "🗺️",
      title: "AI-Powered Mind Maps",
      tagline: "Turn Chaos into Visual Clarity",
      description:
        "Upload any syllabus and watch it transform into an interactive knowledge tree. Click nodes to explore, mark topics complete, and see how everything connects.",
      highlights: [
        "Auto-parse PDFs & text",
        "Interactive nodes",
        "Visual progress",
        "Infinite subtopics",
      ],
    },
    {
      icon: "🤖",
      title: "24/7 AI Study Assistant",
      tagline: "Your Personal Tutor, Always Available",
      description:
        "Stuck on a concept? Click any topic in your mind map to chat with our AI tutor. Get instant explanations, examples, and breakdowns tailored to your level. It's like having a patient teacher who never gets tired of your questions - perfect for late-night study sessions!",
      highlights: [
        "Context-aware explanations",
        "Remembers your conversation history",
        "Adapts to your learning pace",
        "Supports all subjects and topics",
      ],
    },
    {
      icon: "📝",
      title: "Smart Quiz System",
      tagline: "Test Yourself, Level Up",
      description:
        "Generate custom quizzes for any topic with 6 difficulty levels: Beginner (10 questions), Intermediate (12 questions), Revision (15 questions), Super Revision (20 questions), Advanced (18 questions), and Expert (25 questions). Each quiz is tailored to test your knowledge and help you improve. Track your scores, see detailed explanations, and identify weak areas.",
      highlights: [
        "6 difficulty levels with varying question counts",
        "Instant answer validation & explanations",
        "Time tracking for each quiz",
        "Performance analytics & trends",
      ],
    },
    {
      icon: "🎮",
      title: "Gamified Learning Experience",
      tagline: "Make Studying Addictively Fun",
      description:
        "Earn XP for every quiz you complete - the better you perform, the more you earn! Level up from beginner to master as you progress. Each quiz difficulty rewards different XP amounts, and your level increases exponentially, making every achievement count. Watch your XP bar fill up and compete with yourself to reach the next milestone!",
      highlights: [
        "Earn XP based on quiz performance",
        "Exponential leveling system (200 XP → 250 XP → 300 XP...)",
        "Track total XP and current level",
        "Visual progress bars for motivation",
      ],
    },
    {
      icon: "🏆",
      title: "Global Leaderboard",
      tagline: "Compete with Students Worldwide",
      description:
        "See how you stack up against learners from around the world! The leaderboard ranks users by level and XP, showing top performers with special badges. View detailed profiles, compare stats like average scores and total quizzes, and find motivation to climb higher. Filter by Top 10, Top 50, or browse all users with smart pagination.",
      highlights: [
        "Real-time global rankings",
        "Special badges for top 3 users",
        "View other students' profiles & stats",
        "Track your rank and progress over time",
      ],
    },
    {
      icon: "📊",
      title: "Advanced Analytics Dashboard",
      tagline: "Know Your Strengths & Weaknesses",
      description:
        "Get deep insights into your learning journey. Track your average quiz score, highest score, total quizzes taken, and XP earned. See which topics you've mastered and which need more attention. Visualize your progress over time with intuitive charts and metrics that help you study smarter, not harder.",
      highlights: [
        "Comprehensive quiz statistics",
        "Average & best score tracking",
        "Total quizzes and study sessions",
        "Level progression history",
      ],
    },
    {
      icon: "💬",
      title: "AI Doubt Solver",
      tagline: "Ask Anything, Get Smart Answers",
      description:
        "Have a specific question while studying? Our AI doubt solver provides instant, context-aware answers. Unlike generic chatbots, it understands the topic you're studying and gives explanations that build on your current knowledge. Ask follow-up questions, request examples, or get concepts explained in simpler terms.",
      highlights: [
        "Instant doubt resolution",
        "Context-aware responses",
        "Supports follow-up questions",
        "Explains concepts at your level",
      ],
    },
    {
      icon: "🔄",
      title: "Dynamic Subtopic Expansion",
      tagline: "Dive Deep Without Getting Lost",
      description:
        "Every topic can be expanded to reveal deeper subtopics and related concepts. Click on 'Machine Learning' to see Neural Networks, Deep Learning, and more. Click on Neural Networks to explore CNNs, RNNs, Transformers. Go as deep as you need, and the mind map keeps everything organized so you never lose track of the big picture.",
      highlights: [
        "Infinite depth topic exploration",
        "AI-generated subtopics on demand",
        "Breadcrumb navigation",
        "Maintains visual hierarchy",
      ],
    },
    {
      icon: "✅",
      title: "Progress Tracking",
      tagline: "See Your Journey, Stay Motivated",
      description:
        "Mark topics as complete as you study them. Watch your progress bar fill up as you work through your course. See exactly how many topics you've mastered, what's in progress, and what's left to cover. Perfect for planning study sessions and staying motivated as you approach your goals.",
      highlights: [
        "One-click topic completion",
        "Visual progress indicators",
        "Course completion percentage",
        "Study session history",
      ],
    },
    {
      icon: "📱",
      title: "Fully Responsive Design",
      tagline: "Study Anywhere, On Any Device",
      description:
        "Whether you're on your laptop at home, tablet in the library, or phone on the bus - AceMind works perfectly. The interface adapts beautifully to any screen size, so you can study on the go without compromising on functionality. Your progress syncs automatically across all devices.",
      highlights: [
        "Optimized for mobile, tablet & desktop",
        "Touch-friendly interface",
        "Adaptive layouts",
        "Cross-device sync",
      ],
    },
    {
      icon: "�",
      title: "Auto-Save & Cloud Sync",
      tagline: "Never Lose Your Progress",
      description:
        "Everything is saved automatically in real-time. Close your browser, switch devices, or take a break - your mind maps, quiz scores, and study progress are always safe in the cloud. Come back anytime and pick up exactly where you left off, from any device.",
      highlights: [
        "Real-time auto-save",
        "Cloud backup & sync",
        "Cross-device continuity",
        "Zero data loss guarantee",
      ],
    },
    {
      icon: "�",
      title: "Secure & Private",
      tagline: "Your Data, Your Privacy",
      description:
        "We take your privacy seriously. All your data is encrypted and stored securely in Firebase. We never share your information with third parties, and you have full control over your account. Study with peace of mind knowing your learning journey is completely private.",
      highlights: [
        "End-to-end encryption",
        "Secure Firebase authentication",
        "No data sharing with third parties",
        "Full account control",
      ],
    },
  ];

  const faqs = [
    {
      question: "How do I upload a syllabus?",
      answer:
        "Simply paste your syllabus text or upload a PDF file. Our AI will automatically parse and organize it into an interactive knowledge map.",
    },
    {
      question: "Can I edit my map?",
      answer:
        "Yes! You can add, remove, or modify topics in your knowledge map. The system adapts to your learning style and course requirements.",
    },
    {
      question: "Will this help with exam preparation?",
      answer:
        "Absolutely! AceMind identifies critical topics, tracks your progress, and suggests focus areas to optimize your exam preparation.",
    },
    {
      question: "Does it support all subjects?",
      answer:
        "AceMind works with any subject - from Computer Science and Mathematics to Literature and History. Our AI adapts to different academic disciplines.",
    },
    {
      question: "Is there customer support?",
      answer:
        "Yes! We provide comprehensive support through our help center, live chat, and email support to ensure you get the most out of AceMind.",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                AceMind
              </span>
            </motion.div>

            <motion.div
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              {/*  */}
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                FAQ
              </button>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/learn"
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
                <span className="text-4xl">🧠</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Master Any Subject with{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  AI-Powered Learning
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                Your All-in-One Study Platform: Mind Maps, AI Tutoring, Quizzes
                & More
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Transform complex syllabi into visual knowledge maps, compete on
                global leaderboards, and accelerate your learning with
                AI-powered study tools.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/learn">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-lg shadow-lg hover:shadow-yellow-500/50 transition-shadow"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  🚀 Start Learning Free
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  className="px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white font-bold rounded-xl text-lg hover:border-yellow-500 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Explore Features
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  18+
                </div>
                <div className="text-sm text-gray-400 mt-1">Features</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  AI
                </div>
                <div className="text-sm text-gray-400 mt-1">Powered</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-400 mt-1">Available</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  ∞
                </div>
                <div className="text-sm text-gray-400 mt-1">Subjects</div>
              </div>
            </motion.div>

            {/* Hero Animation/Preview */}
            <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-500/30">
                    <div className="text-4xl mb-3">🗺️</div>
                    <h3 className="font-semibold mb-2">Mind Maps</h3>
                    <p className="text-sm text-gray-400">
                      Visual knowledge trees
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-orange-500/30">
                    <div className="text-4xl mb-3">🤖</div>
                    <h3 className="font-semibold mb-2">AI Tutor</h3>
                    <p className="text-sm text-gray-400">
                      24/7 study assistant
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-yellow-500/30">
                    <div className="text-4xl mb-3">🏆</div>
                    <h3 className="font-semibold mb-2">Compete</h3>
                    <p className="text-sm text-gray-400">Global leaderboards</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Modern Learners
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your study experience - from
              AI-powered tools to gamification
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl mb-4 border border-yellow-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-yellow-400 text-sm font-medium mb-3">
                  {feature.tagline}
                </p>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Highlights - Compact bullets */}
                <div className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-500 text-xs"
                    >
                      <div className="w-1 h-1 bg-yellow-400/60 rounded-full flex-shrink-0"></div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See AceMind in{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Watch how your syllabus transforms into an interactive learning
              experience
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6">
                From Chaos to Clarity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-semibold">
                    1
                  </div>
                  <span>Upload your syllabus or paste course content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-semibold">
                    2
                  </div>
                  <span>AI creates an interactive knowledge map</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-semibold">
                    3
                  </div>
                  <span>Track progress and get instant explanations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-semibold">
                    4
                  </div>
                  <span>Master your coursework with confidence</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Progress Overview
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Linear Regression</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Neural Networks</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deep Learning</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="text-sm text-yellow-400 mb-1">
                    Next Recommended Topic
                  </div>
                  <div className="font-semibold">
                    Convolutional Neural Networks
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about AceMind
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-xl border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/50 transition-colors rounded-xl"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: openFaq === index ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: { duration: 0.3, ease: "easeInOut" },
                          opacity: { duration: 0.2, delay: 0.1 },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          opacity: { duration: 0.1 },
                          height: {
                            duration: 0.3,
                            delay: 0.1,
                            ease: "easeInOut",
                          },
                        },
                      }}
                      style={{ overflow: "hidden" }}
                      className="px-6"
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="pb-4"
                      >
                        <p className="text-gray-300">{faq.answer}</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Master Your{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Coursework?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their learning
              experience with AceMind
            </p>
            <Link href="/learn">
              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-lg shadow-lg"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                🎓 Get Started Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🧠</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  AceMind
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                Transform your learning experience with interactive syllabus
                maps and AI-powered study assistance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div></div>
                <Link href="#features">Features</Link>
                <div></div>
                <Link href="#pricing">Pricing</Link>
                <div></div>
                <Link href="#demo">Demo</Link>
                <div></div>
                <Link href="#support">Support</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <div className="space-y-2 text-gray-400">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Cookie Policy</div>
                <div>Contact</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AceMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
