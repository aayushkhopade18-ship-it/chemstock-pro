import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

export const IssueContext = createContext();

export function IssueProvider({ children }) {
  const { collegeId, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!collegeId) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listens to: colleges/{collegeId}/issues
    const issuesRef = collection(db, "colleges", collegeId, "issues");

    const unsubscribe = onSnapshot(
      issuesRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIssues(items);
        setLoading(false);
      },
      (error) => {
        console.error("IssueContext error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collegeId, authLoading]);

  return (
    <IssueContext.Provider value={{ issues, loading }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  return useContext(IssueContext);
}