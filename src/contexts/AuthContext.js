"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import {onAuthStateChange, getUserData} from "../lib/auth";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
          });

          // Fetch additional user data from Firestore
          const result = await getUserData(firebaseUser.uid);
          if (result.success) {
            setUserData(result.userData);
          } else {
            console.error("Failed to fetch user data:", result.error);
            setError(result.error);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user,
    setUserData, // Allow manual updates to user data
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
