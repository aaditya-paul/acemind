"use client";

import React, {useState} from "react";
import {motion} from "framer-motion";
import {
  initializeFirestoreData,
  checkInitialDataExists,
} from "@/lib/initializeData";

const AdminInitializePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [dataStatus, setDataStatus] = useState(null);
  const [error, setError] = useState("");

  const checkDataStatus = async () => {
    try {
      setIsLoading(true);
      const result = await checkInitialDataExists();
      setDataStatus(result);
      if (result.exists) {
        setStatus(
          `✅ Initial data exists: ${result.categoriesCount} categories, ${result.pathsCount} learning paths`
        );
      } else {
        setStatus(
          "❌ No initial data found. Click 'Initialize Data' to set up."
        );
      }
    } catch (err) {
      setError(`Error checking data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeData = async () => {
    try {
      setIsLoading(true);
      setError("");
      setStatus("🔄 Initializing Firestore data...");

      const result = await initializeFirestoreData();

      if (result.success) {
        setStatus("✅ Firestore data initialized successfully!");
        // Check status again to update counts
        await checkDataStatus();
      } else {
        setError(`❌ Failed to initialize data: ${result.error}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkDataStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🔧 AceMind Admin Panel
            </h1>
            <p className="text-gray-400 text-lg">
              Initialize and manage Firestore data
            </p>
          </div>

          {/* Main Panel */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
            {/* Status Display */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                📊 Data Status
              </h2>
              <div className="bg-gray-700 rounded-lg p-4">
                {status && (
                  <p className="text-white text-sm font-mono">{status}</p>
                )}
                {error && (
                  <p className="text-red-400 text-sm font-mono mt-2">{error}</p>
                )}
                {dataStatus && (
                  <div className="mt-4 text-sm text-gray-300">
                    <p>Categories: {dataStatus.categoriesCount || 0}</p>
                    <p>Learning Paths: {dataStatus.pathsCount || 0}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <motion.button
                onClick={checkDataStatus}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
              >
                {isLoading ? "🔄 Checking..." : "🔍 Check Data Status"}
              </motion.button>

              <motion.button
                onClick={initializeData}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
              >
                {isLoading ? "🔄 Initializing..." : "🚀 Initialize Data"}
              </motion.button>
            </div>

            {/* Data Overview */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                📋 What will be created:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">
                    📚 Categories (6)
                  </h4>
                  <ul className="space-y-1">
                    <li>• Mathematics</li>
                    <li>• Science</li>
                    <li>• Technology</li>
                    <li>• Languages</li>
                    <li>• Business</li>
                    <li>• Creative Arts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">
                    🛤️ Learning Paths (3)
                  </h4>
                  <ul className="space-y-1">
                    <li>• Web Development Fundamentals</li>
                    <li>• Introduction to Data Science</li>
                    <li>• Business Fundamentals</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">
                    📖 Study Materials (3)
                  </h4>
                  <ul className="space-y-1">
                    <li>• HTML Reference Guide</li>
                    <li>• Python Quick Reference</li>
                    <li>• Business Plan Template</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">
                    ❓ Quiz Questions (3)
                  </h4>
                  <ul className="space-y-1">
                    <li>• HTML Basics</li>
                    <li>• Python Variables</li>
                    <li>• Business Planning</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg">
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠️</span>
                <div className="text-yellow-200 text-sm">
                  <p className="font-semibold mb-1">Important Notes:</p>
                  <ul className="space-y-1">
                    <li>
                      • This will create initial data in your Firestore database
                    </li>
                    <li>
                      • Existing data with the same IDs will be overwritten
                    </li>
                    <li>• Make sure you have proper Firestore permissions</li>
                    <li>
                      • This operation cannot be easily undone - backup your
                      data first
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminInitializePage;
