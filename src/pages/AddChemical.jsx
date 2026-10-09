import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFlask,
  FaArrowLeft,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaSpinner,
  FaTruck,
  FaPhoneAlt,
  FaEnvelope,
  FaUserTie,
  FaMapMarkerAlt,
  FaPlus,
  FaCalendarAlt,
} from "react-icons/fa";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

import { ChemicalContext } from "../context/ChemicalContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";

/* ==========================================================================
   1. SMART FORMULA PARSER & AUTO-CAPITALIZER
   ========================================================================== */
const ELEMENTS_2 = [
  "he","li","be","ne","na","mg","al","si","cl","ar","ca","sc","ti","cr","mn",
  "fe","co","ni","cu","zn","ga","ge","as","se","br","kr","rb","sr","zr","nb",
  "mo","tc","ru","rh","pd","ag","cd","in","sn","sb","te","xe","cs","ba","la",
  "ce","pr","nd","pm","sm","eu","gd","tb","dy","ho","er","tm","yb","lu","hf",
  "ta","re","os","ir","pt","au","hg","tl","pb","bi","po","at","rn","fr","ra",
  "ac","th","pa","pb"
];
const ELEMENTS_1 = ["h","b","c","n","o","f","p","s","k","v","i","w","u","y"];

function autoFormatFormula(input) {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.includes(" ")) return "";

  let result = "";
  let i = 0;
  const lower = trimmed.toLowerCase();

  while (i < lower.length) {
    const two = lower.slice(i, i + 2);
    if (ELEMENTS_2.includes(two)) {
      result += two.charAt(0).toUpperCase() + two.charAt(1).toLowerCase();
      i += 2;
      continue;
    }
    const one = lower.charAt(i);
    if (ELEMENTS_1.includes(one)) {
      result += one.toUpperCase();
      i += 1;
      continue;
    }
    result += trimmed.charAt(i);
    i += 1;
  }
  return result;
}

/* ==========================================================================
   2. COMPREHENSIVE COLLEGE LAB CHEMICAL REGISTRY
   ========================================================================== */
const LAB_DICTIONARY = {
  nh3: {
    name: "Ammonia",
    formula: "NH3",
    category: "Weak Base / Corrosive Gas",
    hazardLevel: "High",
    signalWord: "Danger",
    storage: "Store in a cool, well-ventilated corrosive/base storage cabinet. Keep isolated from halogens and acids.",
    handling: "Extremely pungent and choking vapor. Causes severe respiratory and eye burns. Handle strictly in a fume hood.",
    ppe: ["Chemical splash goggles", "Nitrile/neoprene gloves", "Laboratory coat", "Vapor fume hood mandatory"],
    firstAid: "Inhalation: Remove victim to fresh air immediately. Eyes: Flush continuously with water for at least 20 minutes.",
    spill: "Evacuate area. Neutralize liquid residues carefully with dilute citric acid under full ventilation.",
  },
  nacl: {
    name: "Sodium Chloride",
    formula: "NaCl",
    category: "Inorganic Salt",
    hazardLevel: "Low",
    signalWord: "Caution",
    storage: "Store in a cool, dry area in tightly sealed containers. Protect from high humidity.",
    handling: "Non-hazardous under normal laboratory procedures. Practice standard hygiene.",
    ppe: ["Safety glasses with side shields", "Standard nitrile gloves", "Laboratory coat"],
    firstAid: "Eyes: Flush with clean water. Ingestion: Non-toxic in normal lab quantities.",
    spill: "Sweep or vacuum dry material. Suitable for standard disposal.",
  },
  hcl: {
    name: "Hydrochloric Acid",
    formula: "HCl",
    category: "Strong Mineral Acid",
    hazardLevel: "High",
    signalWord: "Danger",
    storage: "Store in a dedicated corrosion-proof acid cabinet. Separate from bases and metals.",
    handling: "Causes severe burns and vapor inhalation hazards. Dispense strictly in a fume hood.",
    ppe: ["Splash goggles", "Acid-resistant nitrile gloves", "Acid apron", "Fume hood"],
    firstAid: "Skin/Eyes: Rinse continuously with water for 20 minutes. Call emergency services.",
    spill: "Neutralize carefully with sodium bicarbonate (baking soda) before absorbing.",
  },
  h2so4: {
    name: "Sulfuric Acid",
    formula: "H2SO4",
    category: "Strong Mineral Acid",
    hazardLevel: "High",
    signalWord: "Danger",
    storage: "Store in dedicated acid cabinet. Never store near organic solvents or water.",
    handling: "Extremely exothermic dilution! ALWAYS add acid slowly into water with stirring.",
    ppe: ["Full face shield + goggles", "Heavy-duty neoprene gloves", "Rubber apron", "Fume hood"],
    firstAid: "Immediate 20-minute eyewash/shower. Prompt emergency medical attention is mandatory.",
    spill: "Dike spill area with sand. Neutralize slowly with sodium carbonate with ventilation on.",
  },
  naoh: {
    name: "Sodium Hydroxide",
    formula: "NaOH",
    category: "Strong Caustic Base",
    hazardLevel: "High",
    signalWord: "Danger",
    storage: "Store in plastic or lined containers in a dry area. Keep separated from acids.",
    handling: "Highly hygroscopic and exothermic upon dissolving. Causes rapid, deep chemical burns.",
    ppe: ["Chemical splash goggles", "Thick nitrile or PVC gloves", "Lab coat", "Face shield"],
    firstAid: "Eyes: Severe blindness risk. Flush immediately for 30 minutes. Seek emergency medical care.",
    spill: "Neutralize cautiously with dilute citric or boric acid before cleaning.",
  },
  acetone: {
    name: "Acetone",
    formula: "C3H6O",
    category: "Organic Solvent / Flammable Liquid",
    hazardLevel: "Moderate",
    signalWord: "Danger",
    storage: "Store in an approved flammables safety cabinet away from all heat and ignition sources.",
    handling: "Highly volatile and flammable liquid and vapor. Keep containers closed when not in use.",
    ppe: ["Safety glasses", "Butyl rubber gloves", "Lab coat"],
    firstAid: "Inhalation: Supply fresh air. Eyes: Rinse with water. Ingestion: Do NOT induce vomiting.",
    spill: "Extinguish all ignition sources. Absorb with inert non-combustible material.",
  },
  kmno4: {
    name: "Potassium Permanganate",
    formula: "KMnO4",
    category: "Strong Oxidizer",
    hazardLevel: "High",
    signalWord: "Danger",
    storage: "Store in a dedicated oxidizer cabinet. Strictly isolate from organics and flammables.",
    handling: "Violent fire hazard with organic matter. Stains skin brown. Handle with dry spatulas.",
    ppe: ["Safety goggles", "Heavy nitrile gloves", "Lab coat"],
    firstAid: "Skin: Wash immediately with soap and water. Eyes: Continuous flush for 20 minutes.",
    spill: "Collect without creating dust. Neutralize residues with dilute sodium bisulfite.",
  },
};

/* ==========================================================================
   3. UNIVERSAL SAFETY CLASSIFIER
   ========================================================================== */
function generateUniversalSafety(name, formula, prop = {}) {
  const text = `${name} ${formula} ${prop.IUPACName || ""} ${prop.Title || ""}`.toLowerCase();

  let hazardLevel = "Moderate";
  let signalWord = "Warning";
  let category = "General Chemical Reagent";
  let storage = "Store in a cool, dry, well-ventilated area in a tightly closed container.";
  let handling = "Avoid direct contact with eyes, skin, and clothing. Wear standard lab PPE. Wash hands thoroughly after handling.";
  let ppe = ["Safety glasses with side shields", "Standard nitrile gloves", "Laboratory coat"];
  let firstAid = "Eyes: Flush immediately with water for 15 minutes. Skin: Wash thoroughly with soap and water.";
  let spill = "Wear PPE. Collect spilled material into an approved waste container for chemical disposal.";

  if (/ammonia|amine|nh3|nh4/i.test(text)) {
    category = "Amine / Alkaline Base";
    hazardLevel = "High";
    signalWord = "Danger";
    storage = "Store in a dedicated base/corrosive cabinet. Keep away from acids and oxidizers.";
    handling = "Corrosive and irritating vapors. Handle strictly inside an operating fume hood.";
    ppe = ["Chemical splash goggles", "Nitrile gloves", "Lab coat", "Fume hood"];
  } else if (/acid|hydrogen chloride|sulfate|nitric|phosphate/i.test(text) && !/salt|sodium|potassium/i.test(text)) {
    category = "Acid / Corrosive";
    hazardLevel = "High";
    signalWord = "Danger";
    storage = "Store in an approved acid cabinet away from bases, active metals, and oxidizers.";
    handling = "Corrosive. Dispense inside a chemical fume hood. Add acid to water, never water to acid.";
    ppe = ["Chemical splash goggles", "Acid-resistant gloves", "Laboratory coat", "Fume hood"];
  } else if (/hydroxide|oxide|caustic|alkali/i.test(text)) {
    category = "Base / Alkaline";
    hazardLevel = "High";
    signalWord = "Danger";
    storage = "Store in a dedicated base cabinet away from acids and moisture.";
    handling = "Corrosive to tissue. Dissolution generates heat. Avoid eye and skin contact.";
    ppe = ["Splash goggles", "Nitrile or PVC gloves", "Laboratory coat", "Face shield"];
  } else if (/ethanol|methanol|acetone|ether|benzene|toluene|hexane|solvent/i.test(text)) {
    category = "Flammable Solvent";
    hazardLevel = "Moderate";
    signalWord = "Danger";
    storage = "Store in an approved flammables safety storage cabinet away from ignition sources.";
    handling = "Volatile liquid. Keep away from heat, sparks, and open flames. Use in well-ventilated area.";
    ppe = ["Safety glasses with side shields", "Solvent-resistant gloves", "Lab coat"];
  } else if (/chloride|sulfate|carbonate|phosphate|bromide|iodide/i.test(text)) {
    category = "Inorganic Salt";
    hazardLevel = "Low";
    signalWord = "Caution";
    storage = "Store in standard chemical shelving in a dry location. Keep containers tightly closed.";
    handling = "Low toxicity under normal laboratory procedures. Minimize dust creation.";
    ppe = ["Safety glasses", "Nitrile gloves", "Laboratory coat"];
  }

  return {
    name: prop.Title || name,
    formula: prop.MolecularFormula || formula || "—",
    category,
    hazardLevel,
    signalWord,
    storage,
    handling,
    ppe,
    firstAid,
    spill,
    cid: prop.CID || null,
  };
}

/* ==========================================================================
   4. PUBCHEM RESOLVER
   ========================================================================== */
async function resolveFromPubChem(queryText, formattedFormula) {
  const query = queryText.trim();
  if (!query) return null;

  if (formattedFormula && formattedFormula.length >= 2) {
    try {
      const formulaRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${encodeURIComponent(formattedFormula)}/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON`
      );
      if (formulaRes.ok) {
        const data = await formulaRes.json();
        const prop = data?.PropertyTable?.Properties?.[0];
        if (prop) return prop;
      }
    } catch (e) {}
  }

  try {
    const directRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON`
    );
    if (directRes.ok) {
      const data = await directRes.json();
      const prop = data?.PropertyTable?.Properties?.[0];
      if (prop) return prop;
    }
  } catch (e) {}

  return null;
}

/* ==========================================================================
   5. ADD CHEMICAL COMPONENT
   ========================================================================== */
export default function AddChemical() {
  const navigate = useNavigate();
  const { addChemical } = useContext(ChemicalContext);
  const { hasFullAccess, collegeId } = useAuth();

  const [form, setForm] = useState({
    name: "",
    formula: "",
    quantity: "",
    unit: "g",
    minimumStock: "100",
    location: "Main Cabinet",
    boughtDate: new Date().toISOString().split("T")[0], // Defaults to today's procurement date
    category: "",
    expiry: "",
  });

  /* Supplier State */
  const [suppliersList, setSuppliersList] = useState([]);
  const [supplierMode, setSupplierMode] = useState("select");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierDetails, setSupplierDetails] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const [safety, setSafety] = useState(null);
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchTimer = useRef(null);
  const lastQuery = useRef("");

  useEffect(() => {
    if (!collegeId) return;

    const suppliersRef = collection(db, "colleges", collegeId, "suppliers");
    const unsubscribe = onSnapshot(
      suppliersRef,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliersList(list);
      },
      (err) => {
        console.error("Failed to load suppliers:", err);
      }
    );

    return () => unsubscribe();
  }, [collegeId]);

  const handleSupplierSelect = (e) => {
    const val = e.target.value;
    setSelectedSupplierId(val);

    if (val === "NEW") {
      setSupplierMode("new");
      setSupplierDetails({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });
      return;
    }

    const found = suppliersList.find((s) => s.id === val);
    if (found) {
      setSupplierDetails({
        name: found.supplierName || found.name || "",
        contactPerson: found.contactPerson || found.contact || "",
        phone: found.phone || found.phoneNumber || "",
        email: found.email || found.emailAddress || "",
        address: found.address || "",
      });
    } else {
      setSupplierDetails({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const candidateFormula = autoFormatFormula(val);

    setForm((prev) => ({
      ...prev,
      name: val,
      formula: candidateFormula,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierFieldChange = (e) => {
    const { name, value } = e.target;
    setSupplierDetails((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const raw = form.name.trim();

    if (!raw || raw.length < 2) {
      setSafety(null);
      setStatusMessage("");
      lastQuery.current = "";
      return;
    }

    if (raw.toLowerCase() === lastQuery.current) return;

    if (searchTimer.current) clearTimeout(searchTimer.current);

    setSearching(true);
    setStatusMessage("Searching chemical databases...");

    searchTimer.current = setTimeout(async () => {
      lastQuery.current = raw.toLowerCase();
      const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
      const formatted = autoFormatFormula(raw);

      const localMatch =
        LAB_DICTIONARY[key] ||
        Object.values(LAB_DICTIONARY).find(
          (c) => c.name.toLowerCase() === raw.toLowerCase()
        );

      if (localMatch) {
        setSafety(localMatch);
        setForm((prev) => ({
          ...prev,
          formula: localMatch.formula,
          category: localMatch.category,
        }));
        setStatusMessage(`Verified: ${localMatch.name} (Laboratory Database)`);
        setSearching(false);
        return;
      }

      const prop = await resolveFromPubChem(raw, formatted);

      if (prop) {
        const resolvedFormula = prop.MolecularFormula || formatted || raw;
        const generated = generateUniversalSafety(prop.Title || raw, resolvedFormula, prop);
        setSafety(generated);
        setForm((prev) => ({
          ...prev,
          formula: resolvedFormula,
          category: generated.category,
        }));
        setStatusMessage(`Found: ${prop.Title || raw} (NIH PubChem CID: ${prop.CID || "Verified"})`);
      } else {
        const finalFormula = formatted || raw;
        const fallbackSafety = generateUniversalSafety(raw, finalFormula);
        setSafety(fallbackSafety);
        setForm((prev) => ({
          ...prev,
          formula: finalFormula,
          category: fallbackSafety.category,
        }));
        setStatusMessage("Custom Chemical: Generated safety guidelines based on chemical nomenclature.");
      }

      setSearching(false);
    }, 350);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [form.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!hasFullAccess) {
      setError("You do not have permission to modify inventory.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please provide a chemical name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }

    try {
      setSubmitting(true);

      let finalSupplierName = supplierDetails.name.trim();

      if (supplierMode === "new" && finalSupplierName && collegeId) {
        try {
          const suppliersRef = collection(db, "colleges", collegeId, "suppliers");
          await addDoc(suppliersRef, {
            supplierName: finalSupplierName,
            contactPerson: supplierDetails.contactPerson.trim(),
            phone: supplierDetails.phone.trim(),
            email: supplierDetails.email.trim(),
            address: supplierDetails.address.trim(),
            createdAt: serverTimestamp(),
          });
        } catch (supErr) {
          console.warn("Could not save new supplier to directory:", supErr);
        }
      }

      // Save Chemical with boughtDate + purchaseDate
      await addChemical({
        name: form.name.trim(),
        formula: form.formula.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        minimumStock: Number(form.minimumStock) || 0,
        location: form.location.trim(),
        category: form.category.trim() || "General",
        boughtDate: form.boughtDate || new Date().toISOString().split("T")[0],
        purchaseDate: form.boughtDate || new Date().toISOString().split("T")[0],
        expiry: form.expiry,
        supplier: finalSupplierName,
        supplierPhone: supplierDetails.phone.trim(),
        supplierEmail: supplierDetails.email.trim(),
        supplierContactPerson: supplierDetails.contactPerson.trim(),
        supplierAddress: supplierDetails.address.trim(),
        safetyData: safety || null,
      });

      navigate("/inventory");
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to add chemical to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate("/inventory")} style={styles.backBtn}>
            <FaArrowLeft /> Back to Inventory
          </button>
          <div style={styles.label}>
            LABORATORY INVENTORY • {collegeId ? collegeId.toUpperCase().replace("_", " ") : "ACTIVE CAMPUS"}
          </div>
          <h1 style={styles.title}>Add Chemical</h1>
          <p style={styles.subtitle}>
            Register chemicals with procurement dates, linked supplier directories, and automated Safety Data Sheets (MSDS).
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Form Column */}
        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <FaFlask />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Chemical Information</h2>
              <p style={styles.cardSubtitle}>
                Type chemical name/formula & select or register the vendor.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Chemical Name */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Chemical Name or Formula *</label>
              <div style={styles.searchWrapper}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g. NH3, NaCl, Acetone, KMnO4, CaCO3..."
                  required
                  style={styles.input}
                  autoComplete="off"
                />
                <div style={styles.searchIconBox}>
                  {searching ? (
                    <FaSpinner style={styles.spinner} />
                  ) : (
                    <FaSearch style={{ color: "#64748b" }} />
                  )}
                </div>
              </div>
              {statusMessage && (
                <span
                  style={{
                    ...styles.statusHelper,
                    color: statusMessage.includes("Verified") || statusMessage.includes("Found")
                      ? "#38bdf8"
                      : "#94a3b8",
                  }}
                >
                  <FaInfoCircle style={{ marginRight: "4px" }} />
                  {statusMessage}
                </span>
              )}
            </div>

            {/* Formula & Category */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Molecular Formula</label>
                <input
                  type="text"
                  name="formula"
                  value={form.formula}
                  onChange={handleChange}
                  placeholder="Auto-detected"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Inorganic Salt, Acid, Base"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Quantity, Unit & Min Stock */}
            <div style={styles.row3}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="500"
                  min="0.1"
                  step="any"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Unit *</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="bottles">bottles</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Min Stock Alert</label>
                <input
                  type="number"
                  name="minimumStock"
                  value={form.minimumStock}
                  onChange={handleChange}
                  placeholder="Low stock cutoff"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Storage Location & BOUGHT DATE */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Storage Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Salt Shelf 3, Acid Cabinet"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <FaCalendarAlt style={{ marginRight: "4px", color: "#38bdf8" }} />
                  Bought Date (Procurement Date) *
                </label>
                <input
                  type="date"
                  name="boughtDate"
                  value={form.boughtDate}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, borderColor: "rgba(56,189,248,0.35)" }}
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Expiry Date (Shelf Life)</label>
              <input
                type="date"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Supplier Directory Integration Panel */}
            <div style={styles.supplierContainer}>
              <div style={styles.supplierHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaTruck style={{ color: "#38bdf8" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
                    Supplier & Procurement Details
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setSupplierMode("select")}
                    style={{
                      ...styles.modeToggle,
                      background: supplierMode === "select" ? "rgba(56,189,248,0.2)" : "transparent",
                      color: supplierMode === "select" ? "#38bdf8" : "#94a3b8",
                      borderColor: supplierMode === "select" ? "rgba(56,189,248,0.4)" : "transparent",
                    }}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSupplierMode("new");
                      setSelectedSupplierId("NEW");
                      setSupplierDetails({
                        name: "",
                        contactPerson: "",
                        phone: "",
                        email: "",
                        address: "",
                      });
                    }}
                    style={{
                      ...styles.modeToggle,
                      background: supplierMode === "new" ? "rgba(56,189,248,0.2)" : "transparent",
                      color: supplierMode === "new" ? "#38bdf8" : "#94a3b8",
                      borderColor: supplierMode === "new" ? "rgba(56,189,248,0.4)" : "transparent",
                    }}
                  >
                    <FaPlus style={{ fontSize: "9px" }} /> Add New
                  </button>
                </div>
              </div>

              {supplierMode === "select" ? (
                <div>
                  <label style={styles.fieldLabel}>Choose from Registered Suppliers</label>
                  <select
                    value={selectedSupplierId}
                    onChange={handleSupplierSelect}
                    style={styles.select}
                  >
                    <option value="">-- Choose a vendor from Directory --</option>
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName || s.name} {s.contactPerson ? `(${s.contactPerson})` : ""}
                      </option>
                    ))}
                    <option value="NEW">+ Register New Supplier...</option>
                  </select>

                  {selectedSupplierId && selectedSupplierId !== "NEW" && supplierDetails.name && (
                    <div style={styles.supplierPreviewCard}>
                      <div style={{ fontWeight: "700", color: "#38bdf8", fontSize: "14px", marginBottom: "6px" }}>
                        {supplierDetails.name}
                      </div>
                      <div style={styles.previewGrid}>
                        {supplierDetails.contactPerson && (
                          <div style={styles.previewItem}>
                            <FaUserTie style={{ color: "#94a3b8" }} /> {supplierDetails.contactPerson}
                          </div>
                        )}
                        {supplierDetails.phone && (
                          <div style={styles.previewItem}>
                            <FaPhoneAlt style={{ color: "#34d399" }} /> {supplierDetails.phone}
                          </div>
                        )}
                        {supplierDetails.email && (
                          <div style={styles.previewItem}>
                            <FaEnvelope style={{ color: "#facc15" }} /> {supplierDetails.email}
                          </div>
                        )}
                        {supplierDetails.address && (
                          <div style={styles.previewItem}>
                            <FaMapMarkerAlt style={{ color: "#f87171" }} /> {supplierDetails.address}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={styles.row}>
                    <div>
                      <label style={styles.fieldLabel}>Supplier Company Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={supplierDetails.name}
                        onChange={handleSupplierFieldChange}
                        placeholder="e.g. Sigma-Aldrich / Merck"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={supplierDetails.contactPerson}
                        onChange={handleSupplierFieldChange}
                        placeholder="e.g. Rajesh Kumar"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div>
                      <label style={styles.fieldLabel}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={supplierDetails.phone}
                        onChange={handleSupplierFieldChange}
                        placeholder="e.g. +91 98765 43210"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={supplierDetails.email}
                        onChange={handleSupplierFieldChange}
                        placeholder="e.g. sales@vendor.com"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Office Address / City</label>
                    <input
                      type="text"
                      name="address"
                      value={supplierDetails.address}
                      onChange={handleSupplierFieldChange}
                      placeholder="e.g. Unit 4, MIDC Industrial Area, Pune"
                      style={styles.input}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#34d399" }}>
                    ✓ This will automatically add this vendor to your campus Supplier Directory too.
                  </span>
                </div>
              )}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={() => navigate("/inventory")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving to Database..." : "+ Add to Inventory"}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Safety Data Sheet Card */}
        <div style={styles.safetyCard}>
          <div style={styles.safetyHeader}>
            <div style={styles.safetyIcon}>
              <FaShieldAlt />
            </div>
            <div>
              <h2 style={styles.safetyTitle}>Safety Data Sheet (MSDS)</h2>
              <p style={styles.safetySubtitle}>
                Live handling, storage & first aid instructions
              </p>
            </div>
          </div>

          {!safety ? (
            <div style={styles.emptySafety}>
              <FaFlask style={{ fontSize: "40px", color: "#38bdf8", opacity: 0.4 }} />
              <p style={{ marginTop: "14px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
                Type any chemical name or formula like <strong>NH3</strong>, <strong>NaCl</strong>, <strong>KMnO4</strong>, <strong>Acetone</strong>, or <strong>H2SO4</strong> to generate an instant safety profile.
              </p>
            </div>
          ) : (
            <div style={styles.safetyContent}>
              <div style={styles.badgeRow}>
                <span
                  style={{
                    ...styles.hazardBadge,
                    background:
                      safety.hazardLevel === "High"
                        ? "rgba(239,68,68,0.18)"
                        : safety.hazardLevel === "Low"
                        ? "rgba(34,197,94,0.18)"
                        : "rgba(245,158,11,0.18)",
                    color:
                      safety.hazardLevel === "High"
                        ? "#f87171"
                        : safety.hazardLevel === "Low"
                        ? "#4ade80"
                        : "#fbbf24",
                  }}
                >
                  <FaExclamationTriangle style={{ marginRight: "6px" }} />
                  {safety.hazardLevel} Hazard ({safety.signalWord || "Caution"})
                </span>
              </div>

              <div style={styles.safetySection}>
                <h4 style={styles.secTitle}>📦 Safe Storage Protocol</h4>
                <p style={styles.secBody}>{safety.storage}</p>
              </div>

              <div style={styles.safetySection}>
                <h4 style={styles.secTitle}>🧪 Lab Handling Instructions</h4>
                <p style={styles.secBody}>{safety.handling}</p>
              </div>

              {safety.ppe && safety.ppe.length > 0 && (
                <div style={styles.safetySection}>
                  <h4 style={styles.secTitle}>🧤 Recommended PPE</h4>
                  <ul style={styles.ppeList}>
                    {safety.ppe.map((item, idx) => (
                      <li key={idx} style={styles.ppeItem}>
                        <FaCheckCircle style={{ color: "#38bdf8", flexShrink: 0, fontSize: "11px" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {safety.firstAid && (
                <div style={styles.safetySection}>
                  <h4 style={styles.secTitle}>🩹 First Aid Response</h4>
                  <p style={styles.secBody}>{safety.firstAid}</p>
                </div>
              )}

              {safety.spill && (
                <div style={styles.safetySection}>
                  <h4 style={styles.secTitle}>🧹 Spill & Disposal</h4>
                  <p style={styles.secBody}>{safety.spill}</p>
                </div>
              )}

              {safety.cid && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${safety.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.pubchemLink}
                >
                  View full NIH PubChem record <FaExternalLinkAlt style={{ fontSize: "10px" }} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. STYLES
   ========================================================================== */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px 45px",
    background: "linear-gradient(135deg, #071126 0%, #0B1E42 45%, #102A63 100%)",
    color: "#FFFFFF",
    fontFamily: "'Inter', 'Poppins', Arial, sans-serif",
    position: "relative",
    boxSizing: "border-box",
  },
  glowOne: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)",
    top: "-150px",
    right: "-100px",
    pointerEvents: "none",
  },
  header: {
    marginBottom: "28px",
    position: "relative",
    zIndex: 1,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
    marginBottom: "12px",
  },
  label: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "6px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(350px, 0.9fr)",
    gap: "24px",
    alignItems: "start",
    position: "relative",
    zIndex: 1,
  },
  formCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "20px",
    padding: "30px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "20px",
    marginBottom: "22px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
  },
  cardIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(56,189,248,0.15)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },
  cardSubtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "18px",
  },
  fieldLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "600",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIconBox: {
    position: "absolute",
    right: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    animation: "spin 1s linear infinite",
    color: "#38bdf8",
  },
  statusHelper: {
    fontSize: "11px",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.35)",
    color: "#f8fafc",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "#1e293b",
    color: "#f8fafc",
    outline: "none",
    fontSize: "13px",
    cursor: "pointer",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  row3: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr 1fr",
    gap: "14px",
  },
  supplierContainer: {
    background: "rgba(10, 27, 62, 0.45)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "20px",
  },
  supplierHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  modeToggle: {
    border: "1px solid transparent",
    borderRadius: "8px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  supplierPreviewCard: {
    marginTop: "12px",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: "10px",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    fontSize: "12px",
    color: "#cbd5e1",
  },
  previewItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  submitBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },
  errorBox: {
    padding: "12px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    color: "#fca5a5",
    fontSize: "12px",
    marginBottom: "16px",
  },
  safetyCard: {
    background: "linear-gradient(145deg, rgba(20,48,100,0.7), rgba(10,27,62,0.8))",
    border: "1px solid rgba(96,165,250,0.2)",
    borderRadius: "20px",
    padding: "26px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  safetyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "18px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    marginBottom: "20px",
  },
  safetyIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "rgba(56,189,248,0.14)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  safetyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
  },
  safetySubtitle: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },
  emptySafety: {
    textAlign: "center",
    padding: "45px 20px",
  },
  safetyContent: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  badgeRow: {
    display: "flex",
  },
  hazardBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },
  safetySection: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  secTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#cbd5e1",
    fontWeight: "700",
  },
  secBody: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.6",
  },
  ppeList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "4px",
  },
  ppeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#cbd5e1",
  },
  pubchemLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#38bdf8",
    fontSize: "11px",
    textDecoration: "none",
    marginTop: "8px",
  },
};