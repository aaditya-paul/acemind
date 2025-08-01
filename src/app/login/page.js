"use client";

import React, {useState} from "react";
import {motion} from "framer-motion";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {loginWithEmailAndPassword, signInWithGoogle} from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  parseFirebaseError,
  validateEmail,
  validatePassword,
} from "@/lib/errorUtils";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithEmailAndPassword(email, password);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/"); // Redirect to main page
        }, 1500);
      } else {
        // Use the error parsing utility to get user-friendly messages
        const friendlyError = parseFirebaseError(result.error);
        setError(friendlyError);
      }
    } catch (err) {
      // Parse any unexpected errors
      const friendlyError = parseFirebaseError(err);
      setError(friendlyError);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/"); // Redirect to main page
        }, 1500);
      } else {
        // Use the error parsing utility to get user-friendly messages
        const friendlyError = parseFirebaseError(result.error);
        setError(friendlyError);
      }
    } catch (err) {
      // Parse any unexpected errors
      const friendlyError = parseFirebaseError(err);
      setError(friendlyError);
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
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

  const logoVariants = {
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
      transition: {type: "spring", stiffness: 400, damping: 10},
    },
    tap: {
      scale: 0.98,
      transition: {type: "spring", stiffness: 400, damping: 10},
    },
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <motion.div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo Section */}
          <motion.div className="text-center mb-8" variants={logoVariants}>
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: {type: "spring", stiffness: 400, damping: 10},
              }}
            >
              <span className="text-3xl">🧠</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                AceMind
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue your learning journey
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-xl"
            variants={itemVariants}
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  📧 Email Address
                </label>
                <motion.input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
                  required
                  whileFocus={{
                    scale: 1.01,
                    borderColor: "#eab308",
                    transition: {type: "spring", stiffness: 300, damping: 20},
                  }}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  🔐 Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
                    required
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#eab308",
                      transition: {type: "spring", stiffness: 300, damping: 20},
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.95}}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              {/* <motion.div
              className="flex items-center justify-between text-sm"
              variants={itemVariants}
            >
              <label className="flex items-center text-gray-300">
                <motion.input
                  type="checkbox"
                  className="mr-2 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                  whileTap={{scale: 0.95}}
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div> */}

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-500/50 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  variants={buttonVariants}
                  whileHover={!isLoading ? "hover" : {}}
                  whileTap={!isLoading ? "tap" : {}}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full mr-2"
                        animate={{rotate: 360}}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Signing In...
                    </motion.div>
                  ) : (
                    "🚀 Sign In"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              className="mt-6 flex items-center"
              variants={itemVariants}
            >
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </motion.div>

            {/* Social Login */}
            <motion.div className="mt-6 space-y-3" variants={itemVariants}>
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={!isLoading ? {scale: 1.02} : {}}
                whileTap={!isLoading ? {scale: 0.98} : {}}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div className="text-center mt-6" variants={itemVariants}>
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default LoginPage;
