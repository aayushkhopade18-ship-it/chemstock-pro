import React, { useState, useEffect, useMemo } from "react";
import {
  FaMicroscope,
  FaWrench,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaCheck,
  FaTools,
  FaPhoneAlt,
  FaTimes,
  FaClock,
  FaBuilding,
} from "react-icons/fa";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";

export default function Instruments() {
  const { collegeId } = useAuth();

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form State with complete AMC & Servicing fields
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serialNumber: "",
    category: "Analytical & Spectroscopy",
    location: "Main Lab 101",
    status: "Active",
    amcFrequency: "12", // 12 Months = Annual AMC
    lastServicedDate: new Date().toISOString().split("T")[0],
    nextMaintenanceDate: "",
    vendorName: "",
    vendorPhone: "",
    notes: "",
  });

  /* ---------------------------------------------------------
     1. REAL-TIME DATA LISTENER
  --------------------------------------------------------- */
  useEffect(() => {
    if (!collegeId) return;

    setLoading(true);
    const instRef = collection(db, "colleges", collegeId, "instruments");
    const unsubscribe = onSnapshot(
      instRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setInstruments(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load instruments:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collegeId]);

  /* ---------------------------------------------------------
     2. AUTO-CALCULATE NEXT AMC DUE DATE
  --------------------------------------------------------- */
  useEffect(() => {
    if (formData.lastServicedDate && formData.amcFrequency) {
      const last = new Date(formData.lastServicedDate);
      if (!isNaN(last.getTime())) {
        const next = new Date(last);
        next.setMonth(next.getMonth() + parseInt(formData.amcFrequency, 10));
        setFormData((prev) => ({
          ...prev,
          nextMaintenanceDate: next.toISOString().split("T")[0],
        }));
      }
    }
  }, [formData.lastServicedDate, formData.amcFrequency]);

  /* ---------------------------------------------------------
     3. AMC HEALTH HELPER (DUE / OVERDUE LOGIC)
  --------------------------------------------------------- */
  const getMaintenanceHealth = (nextDate, status) => {
    if (status === "Maintenance") {
      return { label: "Under Maintenance", color: "#facc15", badgeClass: "warning", isUnderMaintenance: true };
    }
    if (!nextDate) {
      return { label: "No AMC Date", color: "#94a3b8", badgeClass: "neutral" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(nextDate);
    due.setHours(0, 0, 0, 0);

    if (isNaN(due.getTime())) {
      return { label: "Invalid Date", color: "#94a3b8", badgeClass: "neutral" };
    }

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue (${Math.abs(diffDays)}d ago)`,
        color: "#f87171",
        badgeClass: "danger",
        isOverdue: true,
        diffDays,
      };
    } else if (diffDays <= 30) {
      return {
        label: `Due in ${diffDays} days`,
        color: "#fbbf24",
        badgeClass: "warning",
        isDueSoon: true,
        diffDays,
      };
    } else {
      return {
        label: `Next: ${nextDate}`,
        color: "#4ade80",
        badgeClass: "success",
        diffDays,
      };
    }
  };

  /* ---------------------------------------------------------
     4. SUMMARY METRICS
  --------------------------------------------------------- */
  const activeCount = useMemo(
    () => instruments.filter((i) => (i.status || "").toLowerCase() === "active" || (i.status || "").toLowerCase() === "operational").length,
    [instruments]
  );

  const maintenanceCount = useMemo(
    () => instruments.filter((i) => (i.status || "").toLowerCase() === "maintenance").length,
    [instruments]
  );

  const amcDueCount = useMemo(() => {
    return instruments.filter((i) => {
      const h = getMaintenanceHealth(i.nextMaintenanceDate, i.status);
      return h.isOverdue || h.isDueSoon;
    }).length;
  }, [instruments]);

  /* ---------------------------------------------------------
     5. FILTER & SEARCH
  --------------------------------------------------------- */
  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const name = (inst.instrumentName || inst.name || "").toLowerCase();
      const model = (inst.model || "").toLowerCase();
      const serial = (inst.serialNumber || "").toLowerCase();
      const loc = (inst.location || "").toLowerCase();
      const vendor = (inst.vendorName || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        model.includes(q) ||
        serial.includes(q) ||
        loc.includes(q) ||
        vendor.includes(q);

      if (!matchesSearch) return false;

      const health = getMaintenanceHealth(inst.nextMaintenanceDate, inst.status);

      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return (inst.status || "").toLowerCase() === "active" || (inst.status || "").toLowerCase() === "operational";
      if (statusFilter === "MAINTENANCE") return (inst.status || "").toLowerCase() === "maintenance";
      if (statusFilter === "INACTIVE") return (inst.status || "").toLowerCase() === "inactive";
      if (statusFilter === "DUE") return health.isOverdue || health.isDueSoon;

      return true;
    });
  }, [instruments, searchQuery, statusFilter]);

  /* ---------------------------------------------------------
     6. SAVE NEW INSTRUMENT WITH AMC RECORD
  --------------------------------------------------------- */
  const handleAddInstrument = async (e) => {
    e.preventDefault();
    if (!collegeId) return;

    if (!formData.name.trim()) {
      alert("Please provide an instrument name.");
      return;
    }

    try {
      setSubmitting(true);
      const instRef = collection(db, "colleges", collegeId, "instruments");

      await addDoc(instRef, {
        instrumentName: formData.name.trim(),
        name: formData.name.trim(),
        model: formData.model.trim() || "Standard",
        serialNumber: formData.serialNumber.trim() || "N/A",
        category: formData.category.trim() || "General",
        location: formData.location.trim() || "Lab 101",
        status: formData.status,
        amcFrequency: formData.amcFrequency,
        lastServicedDate: formData.lastServicedDate || "",
        nextMaintenanceDate: formData.nextMaintenanceDate || "",
        vendorName: formData.vendorName.trim(),
        vendorPhone: formData.vendorPhone.trim(),
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
      });

      // Reset Form
      setFormData({
        name: "",
        model: "",
        serialNumber: "",
        category: "Analytical & Spectroscopy",
        location: "Main Lab 101",
        status: "Active",
        amcFrequency: "12",
        lastServicedDate: new Date().toISOString().split("T")[0],
        nextMaintenanceDate: "",
        vendorName: "",
        vendorPhone: "",
        notes: "",
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding instrument:", err);
      alert("Failed to add instrument. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------
     7. ONE-CLICK "MARK SERVICED" (SHIFTS NEXT AMC DATE)
  --------------------------------------------------------- */
  const handleMarkServiced = async (inst) => {
    if (!collegeId) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const freqMonths = parseInt(inst.amcFrequency || "12", 10);

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + freqMonths);
    const nextDateStr = nextDate.toISOString().split("T")[0];

    const confirmed = window.confirm(
      `Mark "${inst.instrumentName || inst.name}" as serviced today?\n\n• Last Serviced: ${todayStr}\n• Next Due: ${nextDateStr}\n• Status set to: Active`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(inst.id);
      const docRef = doc(db, "colleges", collegeId, "instruments", inst.id);
      await updateDoc(docRef, {
        status: "Active",
        lastServicedDate: todayStr,
        nextMaintenanceDate: nextDateStr,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error marking serviced:", err);
      alert("Failed to update maintenance record.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ---------------------------------------------------------
     8. TOGGLE MAINTENANCE STATUS
  --------------------------------------------------------- */
  const handleToggleMaintenance = async (inst) => {
    if (!collegeId) return;
    const newStatus = inst.status === "Maintenance" ? "Active" : "Maintenance";

    try {
      setActionLoadingId(inst.id);
      const docRef = doc(db, "colleges", collegeId, "instruments", inst.id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ---------------------------------------------------------
     9. DELETE INSTRUMENT
  --------------------------------------------------------- */
  const handleDelete = async (id, name) => {
    if (!collegeId) return;
    if (!window.confirm(`Delete "${name}" from lab registry?`)) return;

    try {
      setActionLoadingId(id);
      const docRef = doc(db, "colleges", collegeId, "instruments", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>LABORATORY EQUIPMENT & AMC REGISTRY</div>
          <h1 style={styles.title}>Instruments & Maintenance</h1>
          <p style={styles.subtitle}>
            Monitor operational status, Annual Maintenance Contracts (AMC), and calibration cycles.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} style={styles.addBtn}>
          <FaPlus /> + Add Instrument
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>
            <FaMicroscope />
          </div>
          <div>
            <div style={styles.metricNum}>{instruments.length}</div>
            <div style={styles.metricLabel}>Total Instruments</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
            <FaCheckCircle />
          </div>
          <div>
            <div style={styles.metricNum}>{activeCount}</div>
            <div style={styles.metricLabel}>Active / Operational</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(250,204,21,0.15)", color: "#facc15" }}>
            <FaWrench />
          </div>
          <div>
            <div style={styles.metricNum}>{maintenanceCount}</div>
            <div style={styles.metricLabel}>Under Maintenance</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div
            style={{
              ...styles.metricIcon,
              background: amcDueCount > 0 ? "rgba(239,68,68,0.18)" : "rgba(52,211,153,0.15)",
              color: amcDueCount > 0 ? "#f87171" : "#34d399",
            }}
          >
            <FaClock />
          </div>
          <div>
            <div style={{ ...styles.metricNum, color: amcDueCount > 0 ? "#f87171" : "#f8fafc" }}>
              {amcDueCount}
            </div>
            <div style={styles.metricLabel}>AMC Service Due</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchBarRow}>
        <div style={styles.searchWrapper}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search instrument, model, serial, vendor, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Status ({instruments.length})</option>
          <option value="ACTIVE">Active Only</option>
          <option value="DUE">⚠️ AMC Due / Overdue ({amcDueCount})</option>
          <option value="MAINTENANCE">Under Maintenance ({maintenanceCount})</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>INSTRUMENT</th>
                <th style={styles.th}>MODEL & SERIAL</th>
                <th style={styles.th}>LOCATION</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>AMC DUE DATE</th>
                <th style={styles.th}>AMC VENDOR</th>
                <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.emptyTd}>Loading lab instruments...</td>
                </tr>
              ) : filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyTd}>No instruments registered yet.</td>
                </tr>
              ) : (
                filteredInstruments.map((inst) => {
                  const health = getMaintenanceHealth(inst.nextMaintenanceDate, inst.status);
                  const isBusy = actionLoadingId === inst.id;

                  return (
                    <tr key={inst.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: "700", color: "#f8fafc" }}>
                          {inst.instrumentName || inst.name}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                          {inst.category || "Apparatus"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={{ color: "#cbd5e1", fontSize: "13px" }}>{inst.model || "—"}</div>
                        <div style={styles.serialBadge}>{inst.serialNumber || "N/A"}</div>
                      </td>

                      <td style={{ ...styles.td, color: "#94a3b8" }}>
                        <FaBuilding style={{ marginRight: "6px", fontSize: "11px" }} />
                        {inst.location || "Main Lab"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusPill,
                            background:
                              inst.status === "Maintenance"
                                ? "rgba(250,204,21,0.18)"
                                : inst.status === "Inactive"
                                ? "rgba(148,163,184,0.15)"
                                : "rgba(52,211,153,0.18)",
                            color:
                              inst.status === "Maintenance"
                                ? "#facc15"
                                : inst.status === "Inactive"
                                ? "#94a3b8"
                                : "#4ade80",
                          }}
                        >
                          {inst.status || "Active"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.amcBadge,
                            background:
                              health.badgeClass === "danger"
                                ? "rgba(239,68,68,0.2)"
                                : health.badgeClass === "warning"
                                ? "rgba(245,158,11,0.2)"
                                : health.badgeClass === "success"
                                ? "rgba(34,197,94,0.18)"
                                : "rgba(148,163,184,0.12)",
                            color: health.color,
                          }}
                        >
                          {health.isOverdue && <FaExclamationTriangle style={{ marginRight: "5px" }} />}
                          {health.label}
                        </span>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                          Cycle: Every {inst.amcFrequency || "12"} months
                        </div>
                      </td>

                      <td style={styles.td}>
                        {inst.vendorName ? (
                          <div>
                            <div style={{ color: "#38bdf8", fontWeight: "600", fontSize: "12px" }}>
                              {inst.vendorName}
                            </div>
                            {inst.vendorPhone && (
                              <div style={{ color: "#94a3b8", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                <FaPhoneAlt style={{ fontSize: "9px" }} /> {inst.vendorPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "12px" }}>In-House</span>
                        )}
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleMarkServiced(inst)}
                            disabled={isBusy}
                            title="Mark as serviced today and update next AMC date"
                            style={styles.actionBtnSuccess}
                          >
                            <FaCheck /> Serviced
                          </button>

                          <button
                            onClick={() => handleToggleMaintenance(inst)}
                            disabled={isBusy}
                            title="Toggle Under Maintenance"
                            style={{
                              ...styles.actionBtnMaint,
                              background: inst.status === "Maintenance" ? "rgba(52,211,153,0.15)" : "rgba(250,204,21,0.15)",
                              color: inst.status === "Maintenance" ? "#4ade80" : "#facc15",
                            }}
                          >
                            <FaTools />
                          </button>

                          <button
                            onClick={() => handleDelete(inst.id, inst.instrumentName || inst.name)}
                            disabled={isBusy}
                            style={styles.actionBtnDelete}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          UPGRADED MODAL (WITH COMPLETE AMC CONTRACT SECTION)
      ========================================================= */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Add New Instrument</h2>
                <p style={styles.modalSub}>Enter laboratory equipment details and AMC maintenance schedule</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddInstrument} style={styles.modalForm}>
              {/* Part 1: Equipment Details */}
              <div style={styles.formGrid}>
                <div style={styles.formCol2}>
                  <label style={styles.label}>Instrument Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UV-Vis Spectrophotometer, Digital Balance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Model</label>
                  <input
                    type="text"
                    placeholder="e.g. UV-1800"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-8947-AB"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Analytical & Spectroscopy">Analytical & Spectroscopy</option>
                    <option value="Chromatography">Chromatography</option>
                    <option value="Thermal & Heating">Thermal & Heating</option>
                    <option value="Optical & Microscopy">Optical & Microscopy</option>
                    <option value="Centrifuges & Shakers">Centrifuges & Shakers</option>
                    <option value="General Apparatus">General Apparatus</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Chem Lab, Shelf B"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Part 2: Dedicated AMC & Maintenance Section */}
              <div style={styles.amcSectionBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <FaWrench style={{ color: "#38bdf8" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#38bdf8", letterSpacing: "0.5px" }}>
                    ANNUAL MAINTENANCE CONTRACT (AMC) & SERVICING
                  </span>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Maintenance Frequency (AMC)</label>
                    <select
                      value={formData.amcFrequency}
                      onChange={(e) => setFormData({ ...formData, amcFrequency: e.target.value })}
                      style={styles.select}
                    >
                      <option value="12">Annual AMC (Every 12 Months)</option>
                      <option value="6">Semi-Annual (Every 6 Months)</option>
                      <option value="3">Quarterly (Every 3 Months)</option>
                      <option value="1">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Operational Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={styles.select}
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Under Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Last Serviced Date</label>
                    <input
                      type="date"
                      value={formData.lastServicedDate}
                      onChange={(e) => setFormData({ ...formData, lastServicedDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Next AMC Due Date (Auto-calculated)</label>
                    <input
                      type="date"
                      value={formData.nextMaintenanceDate}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                      style={{ ...styles.input, borderColor: "rgba(56,189,248,0.4)" }}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>AMC Service Vendor / Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Shimadzu Services, Thermo Fisher"
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Vendor Contact / Helpline Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.vendorPhone}
                      onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Buttons */}
              <div style={styles.modalBtnRow}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  {submitting ? "Saving..." : "+ Add Instrument & Schedule AMC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
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
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  metricCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backdropFilter: "blur(14px)",
  },
  metricIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  metricNum: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "600",
    marginTop: "2px",
  },
  searchBarRow: {
    display: "flex",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchWrapper: {
    flex: 1,
    minWidth: "260px",
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "#64748b",
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px 12px 38px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(15,23,42,0.65)",
    color: "#f8fafc",
    outline: "none",
    fontSize: "13px",
  },
  filterSelect: {
    minWidth: "200px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "#1e293b",
    color: "#f8fafc",
    outline: "none",
    fontSize: "13px",
    cursor: "pointer",
  },
  tableCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "18px",
    padding: "24px",
    backdropFilter: "blur(14px)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  thRow: {
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  th: {
    padding: "12px 14px",
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "700",
  },
  tr: {
    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },
  td: {
    padding: "14px",
    fontSize: "13px",
    color: "#e2e8f0",
  },
  emptyTd: {
    textAlign: "center",
    padding: "45px",
    color: "#64748b",
    fontSize: "13px",
  },
  serialBadge: {
    display: "inline-block",
    fontFamily: "monospace",
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.2)",
    color: "#38bdf8",
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "11px",
    marginTop: "4px",
  },
  statusPill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "14px",
    fontSize: "11px",
    fontWeight: "700",
  },
  amcBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  actionBtnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(52,211,153,0.3)",
    background: "rgba(52,211,153,0.15)",
    color: "#4ade80",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  actionBtnMaint: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(250,204,21,0.3)",
    fontSize: "11px",
    cursor: "pointer",
  },
  actionBtnDelete: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    fontSize: "11px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalCard: {
    background: "#0d1b38",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "26px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
    marginBottom: "16px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },
  modalSub: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "18px",
    cursor: "pointer",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  formCol2: {
    gridColumn: "span 2",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(2,6,23,0.5)",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "#162544",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  amcSectionBox: {
    background: "rgba(2,6,23,0.4)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "12px",
    padding: "16px",
  },
  modalBtnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "11px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "transparent",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "11px 20px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
  },
};