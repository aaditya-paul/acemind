"use client";

import React, {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
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
    hidden: {opacity: 0},
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
      transition: {type: "spring", stiffness: 400, damping: 10},
    },
    tap: {
      scale: 0.98,
      transition: {type: "spring", stiffness: 400, damping: 10},
    },
  };

  const features = [
    {
      icon: "🗺️",
      title: "Visual Syllabus Maps",
      description:
        "Upload your syllabus and get a dynamic, clickable knowledge tree that makes complex courses easy to navigate.",
    },
    {
      icon: "💡",
      title: "Instant Topic Help",
      description:
        "Click any topic to get a concise explanation or summary. Never struggle with understanding course concepts again.",
    },
    {
      icon: "📊",
      title: "Progress Tracker",
      description:
        "Know what's done, what's pending, and what's critical for exams with intelligent progress tracking.",
    },
    {
      icon: "🧭",
      title: "Explore Without Getting Lost",
      description:
        "Dive into subtopics and still stay aligned with the main course. Never lose sight of the big picture.",
    },
    {
      icon: "🔄",
      title: "Auto-Updated Knowledge Graph",
      description:
        "Progress in one topic auto-updates connected nodes, showing how concepts relate to each other.",
    },
    {
      icon: "🎯",
      title: "Smart Study Planning",
      description:
        "Get personalized study recommendations based on your progress and upcoming deadlines.",
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
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
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
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.6, delay: 0.2}}
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
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                Your Personal{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Syllabus Navigator
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Turn Course Chaos into Clarity with Interactive Study Maps
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Transform overwhelming syllabi into visual knowledge maps, track
                your progress, and get instant explanations for any topic.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/learn">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-lg shadow-lg"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  🚀 Try for Free
                </motion.button>
              </Link>
            </motion.div>

            {/* Hero Animation/Preview */}
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-400 mb-2">
                      Upload your syllabus...
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300">
                      "Introduction to Machine Learning 1. Linear Regression 2.
                      Classification Algorithms 3. Neural Networks..."
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-4">⬇️</div>
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                    <div className="text-sm text-yellow-400 mb-2">
                      Transforms into...
                    </div>
                    <div className="text-lg font-semibold">
                      Interactive Knowledge Map 🗺️
                    </div>
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
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            viewport={{once: true}}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to transform how you learn and master
              your coursework
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: index * 0.1}}
                viewport={{once: true}}
                whileHover={{scale: 1.02}}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
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
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            viewport={{once: true}}
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
              initial={{opacity: 0, x: -30}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              viewport={{once: true}}
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
              initial={{opacity: 0, x: 30}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              viewport={{once: true}}
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
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            viewport={{once: true}}
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
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: index * 0.1}}
                viewport={{once: true}}
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/50 transition-colors rounded-xl"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <motion.span
                    className="text-2xl"
                    animate={{rotate: openFaq === index ? 45 : 0}}
                    transition={{duration: 0.2, ease: "easeInOut"}}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{opacity: 0, height: 0}}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: {duration: 0.3, ease: "easeInOut"},
                          opacity: {duration: 0.2, delay: 0.1},
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          opacity: {duration: 0.1},
                          height: {
                            duration: 0.3,
                            delay: 0.1,
                            ease: "easeInOut",
                          },
                        },
                      }}
                      style={{overflow: "hidden"}}
                      className="px-6"
                    >
                      <motion.div
                        initial={{y: -10}}
                        animate={{y: 0}}
                        exit={{y: -10}}
                        transition={{duration: 0.2}}
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
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            viewport={{once: true}}
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
