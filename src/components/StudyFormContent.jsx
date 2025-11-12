"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { setResponseDB } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const StudyFormContent = () => {
  const [topic, setTopic] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const popularTopics = [
    "JavaScript",
    "Python",
    "React",
    "Data Science",
    "Machine Learning",
    "Web Design",
    "AI",
    "Node.js",
  ];

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

  const titleVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: 0.8,
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

  const topicButtonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "#374151",
      borderColor: "#6b7280",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: {
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!topic.trim()) {
      setError("Please enter a topic");
      setLoading(false);
      return;
    }
    if (!syllabus.trim()) {
      setError("Please enter the syllabus");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending data to backend...");
      // Get the current host and use it for the API URL
      const currentHost = window.location.hostname;
      // const apiUrl = `http://${currentHost}:8000/api/submit`;
      const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
      console.log("API URL:", apiUrl);

      const response = await fetch(`${apiUrl}/api/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid, // Track user for analytics
          topic: topic,
          syllabus: syllabus,
        }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.success) {
        // Clear the form
        // setTopic("");
        // setSyllabus("");
        setAiResponse(data.data.aiResponse);
        const res = await setResponseDB(data.data, user.uid);
        if (res.success) {
          console.log("Response saved to DB:", res);
          // setSuccess("Response saved successfully!");
          setSuccess("Form submitted successfully!");
          router.push(`/learn/chat/${res.chatId}`);
        } else {
          setError("Failed to save response to database.");
        }
        setLoading(false);
      } else {
        setError("Error: " + data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting form. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full  px-4 sm:px-6 lg:px-8 text-white flex items-center justify-center">
      <motion.div
        className=" md:py-14 overflow-y-auto p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.div className="text-center mb-6" variants={titleVariants}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            What do you want to{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              study?
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Enter your topic and syllabus to get started with personalized
            learning
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm w-full mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm w-full mx-auto"
          >
            {success}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={containerVariants}
        >
          {/* Topic */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              📚 Study Topic
            </label>
            <motion.input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., JavaScript, ML)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              required
              aria-label="Study topic input"
              whileFocus={{
                scale: 1.01,
                borderColor: "#eab308",
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            />
          </motion.div>

          {/* Syllabus */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="syllabus"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              📝 Syllabus Details
            </label>
            <motion.textarea
              id="syllabus"
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Enter syllabus details or objectives..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base resize-none"
              required
              aria-label="Syllabus input"
              whileFocus={{
                scale: 1.01,
                borderColor: "#eab308",
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleSubmit}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-500/50 shadow-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              whileFocus={{
                boxShadow: "0 0 0 4px rgba(234, 179, 8, 0.5)",
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    className="text-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    🧠
                  </motion.div>
                  <span>Thinking</span>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-gray-900 rounded-full"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                "🚀 START STUDYING"
              )}
              {/* 🚀 START STUDYING */}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Popular Topics */}
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <p className="text-gray-400 text-sm mb-2">Popular topics:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularTopics.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                className="px-3 py-2 bg-gray-800 text-gray-300 rounded-full text-xs sm:text-sm border border-gray-600"
                variants={topicButtonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  },
                }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyFormContent;
