"use client";

import React from "react";
import {useAuth} from "../contexts/AuthContext";
import {motion} from "framer-motion";

const ProtectedRoute = ({children, requireAuth = true}) => {
  const {user, loading} = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
        >
          <motion.div
            className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"
            animate={{rotate: 360}}
            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
          />
          <p className="text-gray-300 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6"
            whileHover={{scale: 1.1}}
          >
            <span className="text-3xl">🔒</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-400 mb-8">
            Please sign in to access this page
          </p>
          <div className="space-y-4">
            <motion.a
              href="/login"
              className="block w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-center"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Sign In
            </motion.a>
            <motion.a
              href="/signup"
              className="block w-full py-3 bg-gray-700 text-white font-medium rounded-xl text-center border border-gray-600"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Create Account
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  // If user is logged in but trying to access auth pages, redirect to dashboard
  if (!requireAuth && user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  // Render children if authentication check passes
  return children;
};

export default ProtectedRoute;
