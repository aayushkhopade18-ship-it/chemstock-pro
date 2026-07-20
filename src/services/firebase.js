import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCaC9aCpviA0pla6JuRzsubKmrQFtU45OM",
  authDomain: "chemstock-pro.firebaseapp.com",
  projectId: "chemstock-pro",
  storageBucket: "chemstock-pro.firebasestorage.app",
  messagingSenderId: "1094338251905",
  appId: "1:1094338251905:web:446a83fd05cc440e825180",
};

const app = initializeApp(firebaseConfig);

console.log("FIREBASE API KEY =", firebaseConfig.apiKey);

export const db = getFirestore(app);
export const auth = getAuth(app);