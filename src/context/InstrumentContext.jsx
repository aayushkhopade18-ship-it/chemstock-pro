import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

export const InstrumentContext =
  createContext(null);

export const InstrumentProvider = ({
  children,
}) => {
  const {
    user,
    collegeId,
    hasFullAccess,
    loading: authLoading,
  } = useAuth();

  const [instruments, setInstruments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD INSTRUMENTS FOR CURRENT COLLEGE
     
     IMPORTANT:
     Each college has its own instruments collection:

     colleges/
       campus_1/
         instruments/
       campus_2/
         instruments/
   ===================================================== */

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !collegeId
    ) {
      setInstruments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const instrumentsRef = collection(
      db,
      "colleges",
      collegeId,
      "instruments"
    );

    const unsubscribe =
      onSnapshot(
        instrumentsRef,
        (snapshot) => {
          const instrumentData =
            snapshot.docs.map(
              (instrumentDoc) => ({
                id: instrumentDoc.id,
                ...instrumentDoc.data(),
              })
            );

          setInstruments(
            instrumentData
          );

          setLoading(false);
        },
        (snapshotError) => {
          console.error(
            "Error loading instruments:",
            snapshotError
          );

          setError(
            snapshotError.message ||
              "Failed to load instruments."
          );

          setInstruments([]);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [
    user,
    collegeId,
    authLoading,
  ]);

  /* =====================================================
     ADD INSTRUMENT
     
     ADMIN + ASSISTANT ONLY
   ===================================================== */

  const addInstrument = async (
    instrumentData
  ) => {
    if (!user) {
      throw new Error(
        "You must be logged in."
      );
    }

    if (!collegeId) {
      throw new Error(
        "College ID is missing."
      );
    }

    if (!hasFullAccess) {
      throw new Error(
        "You do not have permission to add instruments."
      );
    }

    const instrumentsRef =
      collection(
        db,
        "colleges",
        collegeId,
        "instruments"
      );

    const data = {
      ...instrumentData,

      createdBy: user.uid,

      collegeId: collegeId,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    };

    const newInstrument =
      await addDoc(
        instrumentsRef,
        data
      );

    return newInstrument.id;
  };

  /* =====================================================
     UPDATE INSTRUMENT
     
     ADMIN + ASSISTANT ONLY
   ===================================================== */

  const updateInstrument = async (
    id,
    instrumentData
  ) => {
    if (!user) {
      throw new Error(
        "You must be logged in."
      );
    }

    if (!collegeId) {
      throw new Error(
        "College ID is missing."
      );
    }

    if (!hasFullAccess) {
      throw new Error(
        "You do not have permission to edit instruments."
      );
    }

    if (!id) {
      throw new Error(
        "Instrument ID is missing."
      );
    }

    const instrumentRef =
      doc(
        db,
        "colleges",
        collegeId,
        "instruments",
        id
      );

    await updateDoc(
      instrumentRef,
      {
        ...instrumentData,

        updatedAt:
          serverTimestamp(),
      }
    );
  };

  /* =====================================================
     DELETE INSTRUMENT
     
     ADMIN + ASSISTANT ONLY
   ===================================================== */

  const deleteInstrument = async (
    id
  ) => {
    if (!user) {
      throw new Error(
        "You must be logged in."
      );
    }

    if (!collegeId) {
      throw new Error(
        "College ID is missing."
      );
    }

    if (!hasFullAccess) {
      throw new Error(
        "You do not have permission to delete instruments."
      );
    }

    if (!id) {
      throw new Error(
        "Instrument ID is missing."
      );
    }

    const instrumentRef =
      doc(
        db,
        "colleges",
        collegeId,
        "instruments",
        id
      );

    await deleteDoc(
      instrumentRef
    );
  };

  /* =====================================================
     CONTEXT VALUE
   ===================================================== */

  const value = {
    instruments,

    loading,

    error,

    addInstrument,

    updateInstrument,

    deleteInstrument,

    hasFullAccess,

    collegeId,
  };

  return (
    <InstrumentContext.Provider
      value={value}
    >
      {children}
    </InstrumentContext.Provider>
  );
};

/* =========================================================
   CUSTOM HOOK
========================================================= */

export const useInstruments = () => {
  const context =
    useContext(
      InstrumentContext
    );

  if (!context) {
    throw new Error(
      "useInstruments must be used inside InstrumentProvider."
    );
  }

  return context;
};