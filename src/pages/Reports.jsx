import React, { useState, useContext, useMemo } from "react";
import {
  FaChartBar,
  FaFlask,
  FaClipboardList,
  FaMicroscope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileDownload,
  FaPrint,
  FaFilter,
  FaCalendarAlt,
  FaBoxes,
  FaShieldAlt,
  FaBuilding,
} from "react-icons/fa";

import { ChemicalContext } from "../context/ChemicalContext";
import { IssueContext } from "../context/IssueContext";
import { InstrumentContext } from "../context/InstrumentContext";
import { useAuth } from "../context/AuthContext";

export default function Reports() {
  const { chemicals = [] } = useContext(ChemicalContext);
  const { issues = [] } = useContext(IssueContext);
  const { instruments = [] } = useContext(InstrumentContext);
  const { collegeId, userData } = useAuth();

  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "issues" | "instruments" | "safety"
  const [departmentFilter, setDepartmentFilter] = useState("All");

  /* =========================================================
     DATE & EXPIRY CALCULATIONS
  ========================================================= */
  const today = new Date();

  const getDaysLeft = (expiry) => {
    if (!expiry) return null;
    const parts = expiry.split("-");
    let expiryDate;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        expiryDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        expiryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      expiryDate = new Date(expiry);
    }
    if (isNaN(expiryDate.getTime())) return null;

    const current = new Date();
    current.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return Math.ceil((expiryDate - current) / (1000 * 60 * 60 * 24));
  };

  /* =========================================================
     METRICS & AUDIT CALCULATIONS
  ========================================================= */
  const expiredChemicals = useMemo(
    () => chemicals.filter((c) => {
      const d = getDaysLeft(c.expiry);
      return d !== null && d < 0;
    }),
    [chemicals]
  );

  const expiringSoon = useMemo(
    () => chemicals.filter((c) => {
      const d = getDaysLeft(c.expiry);
      return d !== null && d >= 0 && d <= 30;
    }),
    [chemicals]
  );

  const lowStock = useMemo(
    () => chemicals.filter((c) => {
      const q = Number(c.quantity);
      const min = Number(c.minimumStock || c.minStock || 0);
      return !isNaN(q) && min > 0 && q <= min;
    }),
    [chemicals]
  );

  const operationalInstruments = useMemo(
    () => instruments.filter((i) => i.status?.toLowerCase() === "operational" || i.status?.toLowerCase() === "active"),
    [instruments]
  );

  const departments = useMemo(() => {
    const set = new Set();
    issues.forEach((i) => {
      if (i.department) set.add(i.department);
    });
    return ["All", ...Array.from(set)];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (departmentFilter === "All") return issues;
    return issues.filter((i) => i.department === departmentFilter);
  }, [issues, departmentFilter]);

  /* =========================================================
     EXPORT REPORT TO CSV
  ========================================================= */
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `ChemStock_${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === "inventory") {
      headers = ["Chemical Name", "Formula", "Category", "Quantity", "Unit", "Min Stock", "Location", "Expiry Date", "Days Left"];
      rows = chemicals.map((c) => [
        `"${c.name || ""}"`,
        `"${c.formula || ""}"`,
        `"${c.category || ""}"`,
        c.quantity,
        c.unit || "",
        c.minimumStock || 0,
        `"${c.location || ""}"`,
        c.expiry || "N/A",
        getDaysLeft(c.expiry) ?? "N/A",
      ]);
    } else if (activeTab === "issues") {
      headers = ["Chemical", "Formula", "Quantity Issued", "Unit", "Issued To", "Department", "Issue Date", "Purpose", "Issued By"];
      rows = filteredIssues.map((i) => [
        `"${i.chemicalName || ""}"`,
        `"${i.formula || ""}"`,
        i.quantityIssued || i.quantity || 0,
        i.unit || "",
        `"${i.issuedTo || ""}"`,
        `"${i.department || ""}"`,
        i.issueDate || "",
        `"${i.purpose || ""}"`,
        `"${i.issuedBy || ""}"`,
      ]);
    } else if (activeTab === "instruments") {
      headers = ["Instrument Name", "Model", "Serial Number", "Category", "Location", "Status"];
      rows = instruments.map((ins) => [
        `"${ins.instrumentName || ins.name || ""}"`,
        `"${ins.model || ""}"`,
        `"${ins.serialNumber || ""}"`,
        `"${ins.category || ""}"`,
        `"${ins.location || ""}"`,
        `"${ins.status || "Operational"}"`,
      ]);
    } else {
      headers = ["Chemical Name", "Hazard Level", "Signal Word", "Storage Requirements", "Recommended PPE"];
      rows = chemicals.map((c) => [
        `"${c.name || ""}"`,
        `"${c.safetyData?.hazardLevel || "Standard"}"`,
        `"${c.safetyData?.signalWord || "Caution"}"`,
        `"${c.safetyData?.storage || "General Storage"}"`,
        `"${(c.safetyData?.ppe || []).join("; ") || "Standard Lab PPE"}"`,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>
            CAMPUS AUDIT & INTELLIGENCE • {collegeId ? collegeId.toUpperCase().replace("_", " ") : "ACTIVE CAMPUS"}
          </div>
          <h1 style={styles.title}>Laboratory Reports & Analytics</h1>
          <p style={styles.subtitle}>
            Comprehensive operational audits, material consumption registers, and compliance status.
          </p>
        </div>

        <div style={styles.actionGroup}>
          <button onClick={() => window.print()} style={styles.secondaryBtn}>
            <FaPrint /> Print Report
          </button>
          <button onClick={handleExportCSV} style={styles.primaryBtn}>
            <FaFileDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>
            <FaBoxes />
          </div>
          <div>
            <div style={styles.metricNum}>{chemicals.length}</div>
            <div style={styles.metricLabel}>Total Chemical Inventory</div>
            <div style={styles.metricSub}>{chemicals.filter((c) => Number(c.quantity) > 0).length} active in stock</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
            <FaClipboardList />
          </div>
          <div>
            <div style={styles.metricNum}>{issues.length}</div>
            <div style={styles.metricLabel}>Total Chemical Issues</div>
            <div style={styles.metricSub}>Recorded dispenses</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <div style={{ ...styles.metricNum, color: expiringSoon.length > 0 || expiredChemicals.length > 0 ? "#fbbf24" : "#34d399" }}>
              {expiringSoon.length + expiredChemicals.length}
            </div>
            <div style={styles.metricLabel}>Shelf-Life Alerts</div>
            <div style={styles.metricSub}>{expiredChemicals.length} expired • {expiringSoon.length} near expiry</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={{ ...styles.metricIcon, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
            <FaMicroscope />
          </div>
          <div>
            <div style={styles.metricNum}>
              {instruments.length > 0 ? `${Math.round((operationalInstruments.length / instruments.length) * 100)}%` : "100%"}
            </div>
            <div style={styles.metricLabel}>Equipment Health</div>
            <div style={styles.metricSub}>{operationalInstruments.length} of {instruments.length} operational</div>
          </div>
        </div>
      </div>

      {/* Report Section Selector */}
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("inventory")}
            style={{ ...styles.tabBtn, ...(activeTab === "inventory" ? styles.tabBtnActive : {}) }}
          >
            <FaFlask /> Inventory Audit
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            style={{ ...styles.tabBtn, ...(activeTab === "issues" ? styles.tabBtnActive : {}) }}
          >
            <FaClipboardList /> Chemical Dispense & Consumption
          </button>
          <button
            onClick={() => setActiveTab("instruments")}
            style={{ ...styles.tabBtn, ...(activeTab === "instruments" ? styles.tabBtnActive : {}) }}
          >
            <FaMicroscope /> Equipment Registry
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            style={{ ...styles.tabBtn, ...(activeTab === "safety" ? styles.tabBtnActive : {}) }}
          >
            <FaShieldAlt /> Safety & Hazards (MSDS)
          </button>
        </div>

        {activeTab === "issues" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={styles.filterSelect}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* =========================================================
          REPORT TABLES
      ========================================================= */}
      <div style={styles.tableCard}>
        {/* INVENTORY REPORT */}
        {activeTab === "inventory" && (
          <div>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Chemical Inventory Status & Stock Audit</h3>
              <span style={styles.tableCount}>{chemicals.length} total records</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>CHEMICAL</th>
                    <th style={styles.th}>FORMULA</th>
                    <th style={styles.th}>CATEGORY</th>
                    <th style={styles.th}>STOCK QUANTITY</th>
                    <th style={styles.th}>LOCATION</th>
                    <th style={styles.th}>EXPIRY STATUS</th>
                    <th style={styles.th}>AUDIT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {chemicals.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyTd}>No chemicals registered in this campus inventory.</td>
                    </tr>
                  ) : (
                    chemicals.map((chem) => {
                      const days = getDaysLeft(chem.expiry);
                      const isExpired = days !== null && days < 0;
                      const isExpiring = days !== null && days >= 0 && days <= 30;
                      const isLow = Number(chem.quantity) <= Number(chem.minimumStock || 0);

                      return (
                        <tr key={chem.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700" }}>{chem.name}</td>
                          <td style={{ ...styles.td, color: "#38bdf8", fontFamily: "monospace" }}>{chem.formula || "—"}</td>
                          <td style={{ ...styles.td, color: "#94a3b8" }}>{chem.category || "General"}</td>
                          <td style={styles.td}>
                            <strong>{chem.quantity}</strong> <span style={{ color: "#94a3b8" }}>{chem.unit}</span>
                          </td>
                          <td style={{ ...styles.td, color: "#cbd5e1" }}>{chem.location || "Main Storage"}</td>
                          <td style={styles.td}>
                            {chem.expiry ? (
                              <span
                                style={{
                                  ...styles.pill,
                                  background: isExpired ? "rgba(239,68,68,0.18)" : isExpiring ? "rgba(245,158,11,0.18)" : "rgba(34,197,94,0.18)",
                                  color: isExpired ? "#f87171" : isExpiring ? "#fbbf24" : "#4ade80",
                                }}
                              >
                                {isExpired ? `Expired (${Math.abs(days)}d ago)` : isExpiring ? `${days} days left` : chem.expiry}
                              </span>
                            ) : (
                              <span style={{ color: "#64748b", fontSize: "12px" }}>No Expiry Date</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            {isLow ? (
                              <span style={{ ...styles.pill, background: "rgba(239,68,68,0.18)", color: "#f87171" }}>
                                Low Stock
                              </span>
                            ) : (
                              <span style={{ ...styles.pill, background: "rgba(34,197,94,0.18)", color: "#4ade80" }}>
                                Healthy
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ISSUES / CONSUMPTION REPORT */}
        {activeTab === "issues" && (
          <div>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Chemical Consumption & Dispense Log</h3>
              <span style={styles.tableCount}>{filteredIssues.length} issues logged</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>DATE</th>
                    <th style={styles.th}>CHEMICAL</th>
                    <th style={styles.th}>QUANTITY ISSUED</th>
                    <th style={styles.th}>ISSUED TO</th>
                    <th style={styles.th}>DEPARTMENT</th>
                    <th style={styles.th}>PURPOSE</th>
                    <th style={styles.th}>AUTHORIZED BY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyTd}>No chemical issues recorded for this selection.</td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue.id} style={styles.tr}>
                        <td style={{ ...styles.td, color: "#94a3b8" }}>{issue.issueDate || "Recent"}</td>
                        <td style={{ ...styles.td, fontWeight: "700" }}>{issue.chemicalName}</td>
                        <td style={{ ...styles.td, color: "#facc15", fontWeight: "700" }}>
                          {issue.quantityIssued || issue.quantity} {issue.unit}
                        </td>
                        <td style={{ ...styles.td, color: "#f8fafc" }}>{issue.issuedTo}</td>
                        <td style={{ ...styles.td, color: "#38bdf8" }}>{issue.department || "General"}</td>
                        <td style={{ ...styles.td, color: "#94a3b8", maxWidth: "200px" }}>{issue.purpose || "Experiment"}</td>
                        <td style={{ ...styles.td, color: "#64748b", fontSize: "11px" }}>{issue.issuedBy || "Admin"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EQUIPMENT REGISTRY REPORT */}
        {activeTab === "instruments" && (
          <div>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Campus Laboratory Equipment & Instrumentation</h3>
              <span style={styles.tableCount}>{instruments.length} units listed</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>EQUIPMENT NAME</th>
                    <th style={styles.th}>MODEL</th>
                    <th style={styles.th}>SERIAL NUMBER</th>
                    <th style={styles.th}>CATEGORY</th>
                    <th style={styles.th}>LAB LOCATION</th>
                    <th style={styles.th}>OPERATIONAL STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyTd}>No laboratory instruments registered for this campus.</td>
                    </tr>
                  ) : (
                    instruments.map((ins) => {
                      const isOk = ins.status?.toLowerCase() === "operational" || ins.status?.toLowerCase() === "active";
                      const isMaint = ins.status?.toLowerCase() === "maintenance";

                      return (
                        <tr key={ins.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700" }}>{ins.instrumentName || ins.name}</td>
                          <td style={{ ...styles.td, color: "#cbd5e1" }}>{ins.model || "—"}</td>
                          <td style={{ ...styles.td, color: "#38bdf8", fontFamily: "monospace" }}>{ins.serialNumber || "—"}</td>
                          <td style={{ ...styles.td, color: "#94a3b8" }}>{ins.category || "Apparatus"}</td>
                          <td style={{ ...styles.td, color: "#cbd5e1" }}>{ins.location || "Laboratory Room"}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.pill,
                                background: isOk ? "rgba(34,197,94,0.18)" : isMaint ? "rgba(250,204,21,0.18)" : "rgba(239,68,68,0.18)",
                                color: isOk ? "#4ade80" : isMaint ? "#facc15" : "#f87171",
                              }}
                            >
                              {ins.status || "Operational"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SAFETY & COMPLIANCE (MSDS) REPORT */}
        {activeTab === "safety" && (
          <div>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Chemical Hazards & Compliance Audit (MSDS)</h3>
              <span style={styles.tableCount}>{chemicals.length} substances evaluated</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>CHEMICAL</th>
                    <th style={styles.th}>HAZARD LEVEL</th>
                    <th style={styles.th}>SIGNAL WORD</th>
                    <th style={styles.th}>STORAGE PROTOCOL</th>
                    <th style={styles.th}>RECOMMENDED PPE</th>
                  </tr>
                </thead>
                <tbody>
                  {chemicals.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>No chemicals available for safety audit.</td>
                    </tr>
                  ) : (
                    chemicals.map((c) => {
                      const s = c.safetyData || {};
                      const isHigh = s.hazardLevel === "High";

                      return (
                        <tr key={c.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700" }}>{c.name}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.pill,
                                background: isHigh ? "rgba(239,68,68,0.18)" : "rgba(56,189,248,0.18)",
                                color: isHigh ? "#f87171" : "#38bdf8",
                              }}
                            >
                              {s.hazardLevel || "Standard"}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: isHigh ? "#f87171" : "#fbbf24", fontWeight: "700" }}>
                            {s.signalWord || "Caution"}
                          </td>
                          <td style={{ ...styles.td, color: "#cbd5e1", maxWidth: "260px", fontSize: "12px", lineHeight: "1.5" }}>
                            {s.storage || "Store in dedicated chemical storage according to laboratory protocol."}
                          </td>
                          <td style={{ ...styles.td, color: "#94a3b8", fontSize: "12px" }}>
                            {Array.isArray(s.ppe) && s.ppe.length > 0 ? s.ppe.slice(0, 3).join(", ") : "Goggles, Nitrile Gloves, Lab Coat"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    position: "relative",
    zIndex: 1,
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
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  actionGroup: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "28px",
    position: "relative",
    zIndex: 1,
  },
  metricCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backdropFilter: "blur(14px)",
  },
  metricIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  metricNum: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "600",
    marginTop: "2px",
  },
  metricSub: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  tabBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
    gap: "12px",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    background: "rgba(15,23,42,0.55)",
    padding: "5px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 15px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "rgba(56,189,248,0.16)",
    color: "#38bdf8",
    fontWeight: "700",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "#1e293b",
    color: "#f8fafc",
    fontSize: "12px",
    outline: "none",
  },
  tableCard: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "18px",
    padding: "24px",
    backdropFilter: "blur(14px)",
    position: "relative",
    zIndex: 1,
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  tableTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  tableCount: {
    fontSize: "12px",
    color: "#94a3b8",
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
  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "14px",
    fontSize: "11px",
    fontWeight: "700",
  },
};