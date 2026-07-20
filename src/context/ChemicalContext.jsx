import { createContext, useEffect, useState } from "react";

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../services/firebase";

export const ChemicalContext = createContext();

export function ChemicalProvider({ children }) {
  const [chemicals, setChemicals] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "chemicals"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChemicals(list);
      }
    );

    return () => unsubscribe();
  }, []);

  const addChemical = async (chemical) => {
    await addDoc(collection(db, "chemicals"), chemical);
  };

  const deleteChemical = async (id) => {
    await deleteDoc(doc(db, "chemicals", id));
  };

  const updateChemical = async (chemical) => {
    const ref = doc(db, "chemicals", chemical.id);

    await updateDoc(ref, {
      name: chemical.name,
      formula: chemical.formula,
      quantity: chemical.quantity,
      unit: chemical.unit,
      location: chemical.location,
      expiry: chemical.expiry,
      supplier: chemical.supplier,
      category: chemical.category,
    });
  };

  // ⭐ NEW FUNCTION
  const reduceStock = async (chemicalName, issuedQty) => {
    const chemical = chemicals.find(
      (item) => item.name === chemicalName
    );

    if (!chemical) return;

    const currentQty = Number(chemical.quantity);
    const issueQty = Number(issuedQty);

    if (isNaN(currentQty) || isNaN(issueQty)) return;

    const newQty = currentQty - issueQty;

    if (newQty < 0) {
      alert("Not enough stock available!");
      return;
    }

    await updateDoc(doc(db, "chemicals", chemical.id), {
      quantity: newQty.toString(),
    });
  };

  return (
    <ChemicalContext.Provider
      value={{
        chemicals,
        addChemical,
        deleteChemical,
        updateChemical,
        reduceStock,
      }}
    >
      {children}
    </ChemicalContext.Provider>
  );
}