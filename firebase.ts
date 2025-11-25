
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseApiKey = "AIzaSyBvqdLc9Bw84wZp1G63GKVMZB1dyc4XkdA";
const firebaseDatabaseUrl = "https://portal-icone-4eb8e-default-rtdb.firebaseio.com";
const firebaseProjectId = "portal-icone-4eb8e";
const firebaseAuthDomain = "portal-icone-4eb8e.firebaseapp.com";
const firebaseStorageBucket = "portal-icone-4eb8e.firebasestorage.app";
const firebaseMessagingSenderId = "289992630080";
const firebaseAppId = "1:289992630080:web:3cbe972721d22c6ec824a5";
const firebaseMeasurementId = "G-58YNBK8ZC4";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  databaseURL: firebaseDatabaseUrl,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export const firestore = getFirestore(app);
