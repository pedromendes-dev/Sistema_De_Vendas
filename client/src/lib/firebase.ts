// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALwg1SqDI-M3in0gPxXwd-BiksxHuR414",
  authDomain: "sistemav-8c4ad.firebaseapp.com",
  projectId: "sistemav-8c4ad",
  storageBucket: "sistemav-8c4ad.firebasestorage.app",
  messagingSenderId: "1021782754908",
  appId: "1:1021782754908:web:d3c697264546c0facc8899",
  measurementId: "G-JWDQZFEEF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;

