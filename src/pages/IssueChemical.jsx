import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFlask,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaUser,
  FaCalendarAlt,
  FaBuilding,
  FaPaperPlane,
} from "react-icons/fa";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { ChemicalContext } from "../context/ChemicalContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";

export default function IssueChemical() {
  const navigate = useNavigate();
  const { chemicals = [] } = useContext(ChemicalContext);
  const { collegeId, user } = useAuth();

  const [selectedChemicalId, setSelectedChemicalId] = useState("");
  const [issueQuantity, setIssueQuantity] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [department, setDepartment] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Automatically select the first chemical if none selected yet
  useEffect(() => {
    if (!selectedChemicalId && chemicals.length > 0) {
      setSelectedChemicalId(chemicals[0].id);
    }
  }, [chemicals, selectedChemicalId]);

  const selectedChemical = chemicals.find((c) => c.id === selectedChemicalId);

  const availableStock = selectedChemical
    ? Number(selectedChemical.quantity || 0)
    : 0;

  const qtyToIssue = Number(issueQuantity || 0);

  // Clean decimal rounding (avoids floating point bug like 2.0999999999999996)
  const remainingStock = selectedChemical
    ? Math.round((availableStock - qtyToIssue) * 10000) / 10000
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!collegeId) {
      setError("Active campus not detected. Please refresh or re-login.");
      return;
    }

    if (!selectedChemicalId) {
      setError("Please select a chemical to issue.");
      return;
    }

    if (!issueQuantity || qtyToIssue <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }

    if (qtyToIssue > availableStock) {
      setError(
        `Insufficient stock. You cannot issue more than the available ${availableStock} ${
          selectedChemical?.unit || "units"
        }.`
      );
      return;
    }

    if (!issuedTo.trim()) {
      setError("Please enter the recipient name.");
      return;
    }

    try {
      setSubmitting(true);

      // Multi-tenant scoped Firestore references
      const chemicalDocRef = doc(
        db,
        "colleges",
        collegeId,
        "chemicals",
        selectedChemicalId
      );
      const issuesColRef = collection(db, "colleges", collegeId, "issues");

      await runTransaction(db, async (transaction) => {
        const chemicalSnap = await transaction.get(chemicalDocRef);

        if (!chemicalSnap.exists()) {
          throw new Error(
            "Selected chemical was not found in your campus database."
          );
        }

        const currentData = chemicalSnap.data();
        const currentQty = Number(currentData.quantity || 0);

        if (currentQty < qtyToIssue) {
          throw new Error(
            `Stock has changed. Only ${currentQty} ${
              currentData.unit || ""
            } remaining.`
          );
        }

        const updatedQty =
          Math.round(Math.max(0, currentQty - qtyToIssue) * 10000) / 10000;

        // 1. Atomically deduct chemical stock
        transaction.update(chemicalDocRef, {
          quantity: updatedQty,
          updatedAt: serverTimestamp(),
        });

        // 2. Add issue record to the campus register
        const newIssueDoc = doc(issuesColRef);
        transaction.set(newIssueDoc, {
          chemicalId: selectedChemicalId,
          chemicalName:
            currentData.name ||
            currentData.chemicalName ||
            selectedChemical?.name ||
            "Unknown",
          formula: currentData.formula || selectedChemical?.formula || "",
          quantityIssued: qtyToIssue,
          unit: currentData.unit || selectedChemical?.unit || "units",
          issuedTo: issuedTo.trim(),
          department: department.trim() || "General Lab",
          issueDate: issueDate,
          purpose: purpose.trim() || "Lab Experiment",
          issuedBy: user?.email || "Admin",
          createdAt: serverTimestamp(),
        });
      });

      setSuccess(
        `Successfully issued ${qtyToIssue} ${
          selectedChemical?.unit || ""
        } of ${selectedChemical?.name}!`
      );

      setIssueQuantity("");
      setIssuedTo("");
      setDepartment("");
      setPurpose("");

      setTimeout(() => {
        navigate("/issue-register");
      }, 1200);
    } catch (err) {
      console.error("Issue transaction error:", err);
      setError(err.message || "Failed to process issue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />

      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <button
            onClick={() => navigate("/issue-register")}
            style={styles.backBtn}
          >
            <FaArrowLeft /> Back to Issue Register
          </button>
          <div style={styles.badge}>
            CAMPUS DISPENSING •{" "}
            {collegeId ? collegeId.toUpperCase().replace("_", " ") : "ACTIVE CAMPUS"}
          </div>
          <h1 style={styles.title}>Issue Chemical</h1>
          <p style={styles.subtitle}>
            Record chemical usage and automatically deduct stock from your campus inventory.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.grid}>
        {/* Left Form Card */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            {/* Select Chemical */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                <FaFlask style={{ color: "#38bdf8", marginRight: "6px" }} />
                Select Chemical *
              </label>
              <select
                value={selectedChemicalId}
                onChange={(e) => setSelectedChemicalId(e.target.value)}
                style={styles.select}
                required
              >
                {chemicals.length === 0 ? (
                  <option value="">No chemicals registered in this campus</option>
                ) : (
                  chemicals.map((chem) => (
                    <option key={chem.id} value={chem.id}>
                      {chem.name} {chem.formula ? `(${chem.formula})` : ""} — Stock:{" "}
                      {chem.quantity} {chem.unit}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Issue Quantity */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                Issue Quantity * ({selectedChemical?.unit || "units"})
              </label>
              <input
                type="number"
                min="0.0001"
                max={availableStock}
                step="any"
                value={issueQuantity}
                onChange={(e) => setIssueQuantity(e.target.value)}
                placeholder={`Available: ${availableStock} ${selectedChemical?.unit || ""}`}
                style={styles.input}
                required
              />
            </div>

            {/* Recipient Details */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <FaUser style={{ color: "#38bdf8", marginRight: "6px" }} />
                  Issued To (Recipient Name) *
                </label>
                <input
                  type="text"
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>
                  <FaBuilding style={{ color: "#38bdf8", marginRight: "6px" }} />
                  Department / Roll No.
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. B.Sc Chem / Roll #14"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Issue Date */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                <FaCalendarAlt style={{ color: "#38bdf8", marginRight: "6px" }} />
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Purpose */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Purpose / Experiment Details</label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Acid-base titration practical for Semester II"
                style={styles.textarea}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <FaExclamationTriangle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={styles.successBox}>
                <FaCheckCircle style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedChemicalId || availableStock <= 0}
              style={{
                ...styles.submitBtn,
                opacity:
                  submitting || !selectedChemicalId || availableStock <= 0
                    ? 0.6
                    : 1,
                cursor:
                  submitting || !selectedChemicalId || availableStock <= 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting ? (
                <>
                  <FaPaperPlane /> Issuing Chemical...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Issue Chemical
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Calculation & Info Card */}
        <div style={styles.sideCol}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Stock Calculation</h3>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Available Stock:</span>
              <strong style={styles.metricVal}>
                {selectedChemical
                  ? `${availableStock} ${selectedChemical.unit}`
                  : "—"}
              </strong>
            </div>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Being Issued:</span>
              <strong style={{ ...styles.metricVal, color: "#facc15" }}>
                {qtyToIssue > 0
                  ? `${qtyToIssue} ${selectedChemical?.unit || ""}`
                  : "0"}
              </strong>
            </div>

            <div style={styles.divider} />

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Remaining Stock:</span>
              <strong
                style={{
                  ...styles.metricVal,
                  color: remainingStock < 0 ? "#f87171" : "#34d399",
                  fontSize: "18px",
                }}
              >
                {selectedChemical
                  ? `${Math.max(0, remainingStock)} ${selectedChemical.unit}`
                  : "—"}
              </strong>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <FaCheckCircle style={{ color: "#38bdf8", marginTop: "3px", flexShrink: 0 }} />
              <div>
                <h4 style={styles.infoTitle}>Automatic Inventory Update</h4>
                <p style={styles.infoText}>
                  Chemical quantity will be deducted atomically from your campus inventory and added to your college register.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.guidelinesCard}>
            <h4 style={styles.guideTitle}>Issue Guidelines</h4>
            <ul style={styles.guideList}>
              <li>Verify the available stock before issuing.</li>
              <li>Enter the correct recipient information.</li>
              <li>Maintain accurate issue records.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px 45px",
    background: "linear-gradient(135deg, #071126 0%, #0B1E42 45%, #102A63 100%)",
    color: "#FFFFFF",
    fontFamily: "'Inter', Arial, sans-serif",
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
    marginBottom: "26px",
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
  badge: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "6px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)",
    gap: "24px",
    alignItems: "start",
    position: "relative",
    zIndex: 1,
  },
  card: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "18px",
    padding: "28px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "18px",
  },
  fieldLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "600",
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
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.35)",
    color: "#f8fafc",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
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
    gap: "14px",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "10px",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    color: "#fca5a5",
    fontSize: "12px",
    marginBottom: "16px",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    background: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.3)",
    borderRadius: "10px",
    color: "#86efac",
    fontSize: "12px",
    marginBottom: "16px",
  },
  sideCol: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  summaryCard: {
    background: "linear-gradient(145deg, rgba(20,48,100,0.7), rgba(10,27,62,0.8))",
    border: "1px solid rgba(96,165,250,0.2)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  summaryTitle: {
    margin: "0 0 16px 0",
    fontSize: "17px",
    fontWeight: "700",
  },
  metricRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  metricLabel: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  metricVal: {
    fontSize: "14px",
    color: "#f8fafc",
  },
  divider: {
    height: "1px",
    background: "rgba(148,163,184,0.15)",
    margin: "10px 0",
  },
  infoCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "16px",
    padding: "18px",
  },
  infoTitle: {
    margin: "0 0 4px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  infoText: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  guidelinesCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "16px",
    padding: "18px",
  },
  guideTitle: {
    margin: "0 0 10px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#cbd5e1",
  },
  guideList: {
    margin: 0,
    paddingLeft: "18px",
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.8",
  },
};