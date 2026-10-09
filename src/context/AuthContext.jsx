import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // STRICTLY null by default so no one automatically bypasses login
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data);
            setCollegeId(data.collegeId || null);
          } else {
            setUserData(null);
            setCollegeId(null);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserData(null);
          setCollegeId(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setCollegeId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setUser(null);
    setUserData(null);
    setCollegeId(null);
  };

  const role = userData?.role || "user";
  const hasFullAccess = role === "admin" || role === "faculty";

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        collegeId,
        role,
        hasFullAccess,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);