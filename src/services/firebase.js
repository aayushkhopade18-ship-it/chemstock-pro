import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    "AIzaSyCaC9aCpviA0pla6JuRzsubKmrQFtU45OM",
  authDomain:
    "chemstock-pro.firebaseapp.com",
  projectId:
    "chemstock-pro",
  storageBucket:
    "chemstock-pro.firebasestorage.app",
  messagingSenderId:
    "1094338251905",
  appId:
    "1:1094338251905:web:446a83fd05cc440e825180",
  measurementId:
    "G-ESZKRZDJCL",
};

const app =
  initializeApp(
    firebaseConfig
  );

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

export default app;