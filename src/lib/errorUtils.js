// Firebase error code to user-friendly message mapping
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Authentication errors
    "auth/user-not-found":
      "No account found with this email address. Please check your email or sign up for a new account.",
    "auth/wrong-password":
      "Incorrect password. Please try again or reset your password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support for assistance.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later or reset your password.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection and try again.",

    // Registration errors
    "auth/email-already-in-use":
      "An account with this email already exists. Please sign in or use a different email.",
    "auth/weak-password":
      "Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.",
    "auth/invalid-password": "Password must be at least 6 characters long.",
    "auth/missing-password": "Please enter a password.",
    "auth/missing-email": "Please enter an email address.",

    // Google Sign-in errors
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked":
      "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email but different sign-in method. Please try signing in with your original method.",

    // General errors
    "auth/invalid-credential":
      "Invalid email or password. Please check your credentials and try again.",
    "auth/user-token-expired":
      "Your session has expired. Please sign in again.",
    "auth/requires-recent-login":
      "For security, please sign in again to complete this action.",
    "auth/invalid-api-key":
      "Authentication service is temporarily unavailable. Please try again later.",
    "auth/app-deleted":
      "Authentication service is temporarily unavailable. Please try again later.",
    "auth/expired-action-code":
      "This link has expired. Please request a new one.",
    "auth/invalid-action-code":
      "This link is invalid. Please request a new one.",

    // Password reset errors
    "auth/invalid-continue-uri":
      "Invalid reset link. Please request a new password reset.",
    "auth/missing-continue-uri":
      "Invalid reset link. Please request a new password reset.",
    "auth/unauthorized-continue-uri":
      "Invalid reset link. Please request a new password reset.",

    // Multi-factor authentication
    "auth/multi-factor-auth-required":
      "Additional verification required. Please complete the authentication process.",
    "auth/maximum-second-factor-count-exceeded":
      "Maximum number of second factors exceeded.",
    "auth/second-factor-already-in-use":
      "This verification method is already in use.",

    // Quota and limits
    "auth/quota-exceeded":
      "Service temporarily unavailable due to high demand. Please try again later.",
    "auth/project-not-found":
      "Authentication service is temporarily unavailable. Please try again later.",
    "auth/insufficient-permission":
      "You don't have permission to perform this action.",

    // Network and connectivity
    "auth/timeout":
      "Request timed out. Please check your connection and try again.",
    "auth/web-storage-unsupported":
      "Your browser doesn't support the required storage features. Please try a different browser.",
    "auth/already-initialized":
      "Authentication service has already been initialized.",

    // Custom validation errors (for our app)
    "custom/passwords-dont-match":
      "Passwords don't match. Please make sure both password fields are identical.",
    "custom/terms-not-accepted":
      "Please accept the Terms and Conditions to create your account.",
    "custom/missing-fields": "Please fill in all required fields.",
    "custom/invalid-name":
      "Please enter a valid name with only letters and spaces.",
    "custom/password-too-short": "Password must be at least 8 characters long.",
    "custom/password-too-weak":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",

    // Firestore errors
    "firestore/permission-denied":
      "You don't have permission to access this data.",
    "firestore/unavailable":
      "Service temporarily unavailable. Please try again later.",
    "firestore/unauthenticated": "Please sign in to access this feature.",
    "firestore/not-found": "The requested data was not found.",
    "firestore/already-exists": "This data already exists.",
    "firestore/resource-exhausted":
      "Service temporarily unavailable due to high demand. Please try again later.",
    "firestore/cancelled": "The operation was cancelled. Please try again.",
    "firestore/data-loss": "Data corruption detected. Please contact support.",
    "firestore/deadline-exceeded": "Request timed out. Please try again.",
    "firestore/failed-precondition":
      "The operation failed due to a conflict. Please refresh and try again.",
    "firestore/internal": "An internal error occurred. Please try again later.",
    "firestore/invalid-argument":
      "Invalid data provided. Please check your input.",
    "firestore/out-of-range": "The requested operation is out of range.",
    "firestore/aborted":
      "The operation was aborted due to a conflict. Please try again.",
  };

  // If we have a specific message for this error code, return it
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // If it's a Firebase error but not in our mapping, provide a generic message
  if (errorCode && errorCode.startsWith("auth/")) {
    return "An authentication error occurred. Please try again or contact support if the problem persists.";
  }

  if (errorCode && errorCode.startsWith("firestore/")) {
    return "A data service error occurred. Please try again or contact support if the problem persists.";
  }

  // For any other error, return a generic message
  return "An unexpected error occurred. Please try again or contact support if the problem persists.";
};

// Helper function to extract error code from Firebase error object
export const parseFirebaseError = (error) => {
  // If it's already a string, assume it's an error code
  if (typeof error === "string") {
    return getFirebaseErrorMessage(error);
  }

  // If it's a Firebase error object
  if (error && error.code) {
    return getFirebaseErrorMessage(error.code);
  }

  // If it has a message property, try to extract error code from it
  if (error && error.message) {
    // Look for Firebase error codes in the message
    const firebaseErrorMatch = error.message.match(
      /auth\/[\w-]+|firestore\/[\w-]+/
    );
    if (firebaseErrorMatch) {
      return getFirebaseErrorMessage(firebaseErrorMatch[0]);
    }

    // If no Firebase error code found, return the original message if it's user-friendly
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("connection")) {
      return "Network error. Please check your internet connection and try again.";
    }
    if (message.includes("timeout")) {
      return "Request timed out. Please check your connection and try again.";
    }
  }

  // Default fallback
  return "An unexpected error occurred. Please try again or contact support if the problem persists.";
};

// Validation helper functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Please enter an email address.";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Please enter a password.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
};

export const validateStrongPassword = (password) => {
  if (!password) {
    return "Please enter a password.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  return null;
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return "Please enter a name.";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return "Name can only contain letters and spaces.";
  }
  return null;
};
