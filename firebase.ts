// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseDatabaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

if (!firebaseApiKey) {
  throw new Error("Missing VITE_FIREBASE_API_KEY environment variable.");
}

if (!firebaseDatabaseUrl) {
  throw new Error("Missing VITE_FIREBASE_DATABASE_URL environment variable.");
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "portal-icone-4eb8e.firebaseapp.com",
  databaseURL: firebaseDatabaseUrl,
  projectId: "portal-icone-4eb8e",
  storageBucket: "portal-icone-4eb8e.firebasestorage.app",
  messagingSenderId: "289992630080",
  appId: "1:289992630080:web:3cbe972721d22c6ec824a5",
  measurementId: "G-58YNBK8ZC4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth instance and provider
export const auth = getAuth(app);
