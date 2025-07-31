import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {auth, db, googleProvider} from "./firebase";
// import {createSampleUserData} from "./initializeData";

// User registration with email and password
export const registerWithEmailAndPassword = async (
  email,
  password,
  firstName,
  lastName
) => {
  try {
    console.log("🔥 Starting user registration...", {
      email,
      firstName,
      lastName,
    });

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("✅ Firebase Auth user created:", user.uid);

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });
    console.log("✅ User profile updated with display name");

    // Prepare user data for Firestore
    const userData = {
      uid: user.uid,
      firstName,
      lastName,
      email: user.email,
      displayName: `${firstName} ${lastName}`,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      authProvider: "email",
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
      profile: {
        bio: "",
        interests: [],
        learningGoals: [],
      },
      stats: {
        studySessions: 0,
        totalStudyTime: 0,
        topicsStudied: 0,
        streakDays: 0,
      },
    };

    console.log("📝 Saving user data to Firestore...", userData);

    // Save user data to Firestore (removed merge: true to ensure clean write)
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("✅ User data saved to Firestore successfully");

    // Create sample user data for new user
    try {
      console.log("📊 Creating sample user data...");
      await createSampleUserData(user.uid, {
        firstName,
        lastName,
        email: user.email,
        displayName: `${firstName} ${lastName}`,
      });
      console.log("✅ Sample user data created successfully");
    } catch (sampleDataError) {
      console.warn("⚠️ Failed to create sample user data:", sampleDataError);
      // Don't fail registration if sample data creation fails
    }

    console.log("🎉 Registration completed successfully");
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("❌ Registration error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// User login with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update last login time
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastLoginAt: serverTimestamp(),
      },
      {merge: true}
    );

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Google Sign-in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create new user document
      const nameParts = user.displayName?.split(" ") || ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        authProvider: "google",
        preferences: {
          theme: "dark",
          notifications: true,
          language: "en",
        },
        profile: {
          bio: "",
          interests: [],
          learningGoals: [],
        },
        stats: {
          studySessions: 0,
          totalStudyTime: 0,
          topicsStudied: 0,
          streakDays: 0,
        },
      });

      // Create sample user data for new Google user
      try {
        await createSampleUserData(user.uid, {
          firstName,
          lastName,
          email: user.email,
          displayName: user.displayName,
        });
      } catch (sampleDataError) {
        console.warn("Failed to create sample user data:", sampleDataError);
        // Don't fail sign-in if sample data creation fails
      }
    } else {
      // Update last login time for existing user
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: serverTimestamp(),
        },
        {merge: true}
      );
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return {success: true};
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {success: true};
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return {
        success: true,
        userData: userDoc.data(),
      };
    } else {
      return {
        success: false,
        error: "User data not found",
      };
    }
  } catch (error) {
    console.error("Get user data error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  try {
    await setDoc(doc(db, "users", uid), updates, {merge: true});
    return {success: true};
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: error.code || error.message,
    };
  }
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Check email error:", error);
    return false;
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
