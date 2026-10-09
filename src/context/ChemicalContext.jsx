import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../services/firebase.js";
import { useAuth } from "./AuthContext";

export const ChemicalContext = createContext(null);

export function ChemicalProvider({ children }) {
  const { user, collegeId, hasFullAccess } = useAuth();

  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !collegeId) {
      setChemicals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const chemicalsRef = collection(
      db,
      "colleges",
      collegeId,
      "chemicals"
    );

    const unsubscribe = onSnapshot(
      chemicalsRef,
      (snapshot) => {
        const chemicalList = snapshot.docs.map((chemicalDoc) => ({
          id: chemicalDoc.id,
          ...chemicalDoc.data(),
        }));

        setChemicals(chemicalList);
        setLoading(false);
      },
      (err) => {
        console.error("Chemical listener error:", err);
        setError(err.message || "Unable to load chemicals.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, collegeId]);

  async function addChemical(chemicalData) {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    if (!collegeId) {
      throw new Error("College ID is missing.");
    }

    if (!hasFullAccess) {
      throw new Error("You do not have permission to add chemicals.");
    }

    const newChemicalRef = doc(
      collection(db, "colleges", collegeId, "chemicals")
    );

    const dataToSave = {
      ...chemicalData,

      chemicalName: chemicalData.chemicalName || "",
      formula: chemicalData.formula || "",
      casNumber: chemicalData.casNumber || "",
      category: chemicalData.category || "",
      supplier: chemicalData.supplier || "",
      quantity: Number(chemicalData.quantity || 0),

      collegeId,

      safetyData: chemicalData.safetyData || null,

      createdBy: user.uid,
      updatedBy: user.uid,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newChemicalRef, dataToSave);

    return newChemicalRef.id;
  }

  async function updateChemical(chemicalId, updatedData) {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    if (!collegeId) {
      throw new Error("College ID is missing.");
    }

    if (!hasFullAccess) {
      throw new Error("You do not have permission to edit chemicals.");
    }

    if (!chemicalId) {
      throw new Error("Chemical ID is missing.");
    }

    const chemicalRef = doc(
      db,
      "colleges",
      collegeId,
      "chemicals",
      chemicalId
    );

    await setDoc(
      chemicalRef,
      {
        ...updatedData,
        collegeId,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }

  async function deleteChemical(chemicalId) {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    if (!collegeId) {
      throw new Error("College ID is missing.");
    }

    if (!hasFullAccess) {
      throw new Error("You do not have permission to delete chemicals.");
    }

    if (!chemicalId) {
      throw new Error("Chemical ID is missing.");
    }

    const chemicalRef = doc(
      db,
      "colleges",
      collegeId,
      "chemicals",
      chemicalId
    );

    await deleteDoc(chemicalRef);
  }

  async function reduceStock(chemicalId, amount) {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    if (!collegeId) {
      throw new Error("College ID is missing.");
    }

    if (!hasFullAccess) {
      throw new Error("You do not have permission to reduce stock.");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error("Invalid quantity.");
    }

    const chemicalRef = doc(
      db,
      "colleges",
      collegeId,
      "chemicals",
      chemicalId
    );

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(chemicalRef);

      if (!snapshot.exists()) {
        throw new Error("Chemical not found.");
      }

      const currentData = snapshot.data();

      const currentQuantity = Number(currentData.quantity || 0);

      if (currentQuantity < numericAmount) {
        throw new Error("Insufficient chemical stock.");
      }

      transaction.update(chemicalRef, {
        quantity: currentQuantity - numericAmount,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    });
  }

  const value = {
    chemicals,
    loading,
    error,

    collegeId,

    hasFullAccess,

    addChemical,
    updateChemical,
    deleteChemical,
    reduceStock,
  };

  return (
    <ChemicalContext.Provider value={value}>
      {children}
    </ChemicalContext.Provider>
  );
}

/*
  IMPORTANT:
  Your AddChemical.jsx uses useChemical().
  This export fixes the exact error shown in your screenshot.
*/

export function useChemical() {
  const context = useContext(ChemicalContext);

  if (!context) {
    throw new Error(
      "useChemical must be used inside ChemicalProvider."
    );
  }

  return context;
}

export default ChemicalContext;