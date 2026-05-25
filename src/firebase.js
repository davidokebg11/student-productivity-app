import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyAchblFO6ivH1ns26gnoirqJhH7FT_zt_U",
   authDomain: "student-productivity-app-d80e0.firebaseapp.com",
   projectId: "student-productivity-app-d80e0",
   storageBucket: "student-productivity-app-d80e0.firebasestorage.app",
   messagingSenderId: "688937784994",
   appId: "1:688937784994:web:98db59ec7e31cff3f429fb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);