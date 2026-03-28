import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOX0vU5GT0FRHeQaWBglPKQmcy7qpc6r8",
  authDomain: "web-hosting-381ec.firebaseapp.com",
  projectId: "web-hosting-381ec",
  appId: "1:504637972829:web:413e94fc85b71c17c948b4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();