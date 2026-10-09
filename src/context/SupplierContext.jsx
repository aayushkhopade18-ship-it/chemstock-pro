import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { AuthContext } from "./AuthContext";

export const InstrumentContext = createContext();

export function InstrumentProvider({ children }) {
  const {
    user,
    collegeId,
    loading: authLoading,
  } = useContext(AuthContext);

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || !collegeId) {
      setInstruments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const instrumentsQuery = query(
      collection(db, "instruments"),
      where("collegeId", "==", collegeId)
    );

    const unsubscribe = onSnapshot(
      instrumentsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setInstruments(list);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "Instrument Firebase Error:",
          firebaseError
        );

        setError(
          "Unable to load instruments."
        );

        setInstruments([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, collegeId, authLoading]);

  const addInstrument = async (instrument) => {
    if (!user || !collegeId) {
      throw new Error(
        "User is not connected to a college."
      );
    }

    await addDoc(
      collection(db, "instruments"),
      {
        name: instrument.name,
        category: instrument.category,
        quantity: Number(instrument.quantity),
        location: instrument.location,
        condition: instrument.condition,
        status: instrument.status,
        collegeId: collegeId,
      }
    );
  };

  const deleteInstrument = async (id) => {
    if (!user || !collegeId) {
      throw new Error(
        "User is not connected to a college."
      );
    }

    const instrument = instruments.find(
      (item) => item.id === id
    );

    if (!instrument) {
      throw new Error(
        "Instrument not found."
      );
    }

    if (instrument.collegeId !== collegeId) {
      throw new Error(
        "You cannot delete another college's instrument."
      );
    }

    await deleteDoc(
      doc(db, "instruments", id)
    );
  };

  return (
    <InstrumentContext.Provider
      value={{
        instruments,
        addInstrument,
        deleteInstrument,
        loading,
        error,
        collegeId,
      }}
    >
      {children}
    </InstrumentContext.Provider>
  );
}