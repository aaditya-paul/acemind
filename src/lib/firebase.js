// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZE55Sa9qGm7j-OKojK46a9desKTHnXnc",
  authDomain: "acemind-9a8bf.firebaseapp.com",
  projectId: "acemind-9a8bf",
  storageBucket: "acemind-9a8bf.firebasestorage.app",
  messagingSenderId: "146836464874",
  appId: "1:146836464874:web:3aaedfba94482347f76393",
  measurementId: "G-03GSK5SY1T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser environment)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
