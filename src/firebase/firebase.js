import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZT6UkcUitwRFvCa0tqzos2Q1E9IpKcg4",
  authDomain: "hostzuno.firebaseapp.com",
  projectId: "hostzuno",
  storageBucket: "hostzuno.firebasestorage.app",
  messagingSenderId: "236501912578",
  appId: "1:236501912578:web:742eaf79e6e53dea7a2b1b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();