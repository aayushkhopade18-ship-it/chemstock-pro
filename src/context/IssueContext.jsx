import { createContext, useEffect, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../services/firebase";

export const IssueContext = createContext();

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "issues"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setIssues(list);
      }
    );

    return () => unsubscribe();
  }, []);

  const issueChemical = async (issue) => {
    await addDoc(collection(db, "issues"), {
      ...issue,
      date: new Date().toLocaleString(),
    });
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        issueChemical,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}