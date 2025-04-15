// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0w-ASNSNQ8tTFRcD-GoW-VFDPB0uUhCI",
  authDomain: "flex-cms-8b47e.firebaseapp.com",
  projectId: "flex-cms-8b47e",
  storageBucket: "flex-cms-8b47e.firebasestorage.app",
  messagingSenderId: "23024347980",
  appId: "1:23024347980:web:24824a5692a079c25cfde9",
  measurementId: "G-44G581YZFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export {auth, analytics, firestore}