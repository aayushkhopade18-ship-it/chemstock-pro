import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaExclamationTriangle,
  FaSearch,
  FaCalendarAlt,
  FaFlask,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
} from "react-icons/fa";

import { ChemicalContext } from "../context/ChemicalContext";

function ExpiryAlerts() {
  const navigate = useNavigate();

  const { chemicals, loading, error } =
    useContext(ChemicalContext);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  /* =========================
     DAYS LEFT
  ========================= */

  const getDaysLeft = (expiry) => {
    if (!expiry) return null;

    const expiryDate = new Date(expiry);

    if (isNaN(expiryDate.getTime())) {
      return null;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (expiryDate - today) /
        (1000 * 60 * 60 * 24)
    );
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const newDate = new Date(date);

    if (isNaN(newDate.getTime())) {
      return "Invalid Date";
    }

    return newDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================
     GET STATUS
  ========================= */

  const getStatus = (expiry) => {
    const days = getDaysLeft(expiry);

    if (days === null) {
      return {
        label: "No Expiry Date",
        type: "neutral",
      };
    }

    if (days < 0) {
      return {
        label: "Expired",
        type: "expired",
      };
    }

    if (days === 0) {
      return {
        label: "Expires Today",
        type: "expired",
      };
    }

    if (days <= 7) {
      return {
        label: "Critical",
        type: "critical",
      };
    }

    if (days <= 30) {
      return {
        label: "Expiring Soon",
        type: "warning",
      };
    }

    return {
      label: "Safe",
      type: "safe",
    };
  };

  /* =========================
     ALERT CHEMICALS
  ========================= */

  const alertChemicals = useMemo(() => {
    return chemicals
      .filter((chemical) => {
        const days = getDaysLeft(
          chemical.expiry
        );

        return (
          days !== null &&
          days <= 30
        );
      })
      .sort((a, b) => {
        const daysA =
          getDaysLeft(a.expiry) ?? 99999;

        const daysB =
          getDaysLeft(b.expiry) ?? 99999;

        return daysA - daysB;
      });
  }, [chemicals]);

  /* =========================
     FILTER
  ========================= */

  const filteredChemicals =
    alertChemicals.filter((chemical) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        chemical.name
          ?.toLowerCase()
          .includes(searchText) ||
        chemical.formula
          ?.toLowerCase()
          .includes(searchText) ||
        chemical.category
          ?.toLowerCase()
          .includes(searchText) ||
        chemical.location
          ?.toLowerCase()
          .includes(searchText);

      const days = getDaysLeft(
        chemical.expiry
      );

      let matchesFilter = true;

      if (filter === "Expired") {
        matchesFilter = days < 0;
      }

      if (filter === "Critical") {
        matchesFilter =
          days >= 0 && days <= 7;
      }

      if (filter === "Expiring Soon") {
        matchesFilter =
          days > 7 && days <= 30;
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  /* =========================
     STATS
  ========================= */

  const expiredCount =
    chemicals.filter((chemical) => {
      const days = getDaysLeft(
        chemical.expiry
      );

      return days !== null && days < 0;
    }).length;

  const criticalCount =
    chemicals.filter((chemical) => {
      const days = getDaysLeft(
        chemical.expiry
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 7
      );
    }).length;

  const soonCount =
    chemicals.filter((chemical) => {
      const days = getDaysLeft(
        chemical.expiry
      );

      return (
        days !== null &&
        days > 7 &&
        days <= 30
      );
    }).length;

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
          Checking expiry alerts...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>

        <div>

          <button
            onClick={() =>
              navigate("/inventory")
            }
            style={styles.backButton}
          >
            <FaArrowLeft />
            Back to Inventory
          </button>

          <div style={styles.pageLabel}>
            LABORATORY MANAGEMENT
          </div>

          <h1 style={styles.title}>
            Expiry Alerts
          </h1>

          <p style={styles.subtitle}>
            Monitor chemicals approaching
            their expiry date and take
            action before they expire.
          </p>

        </div>


        <div style={styles.alertIconBox}>
          <FaBell />
        </div>

      </div>


      {/* ================= STATS ================= */}

      <div style={styles.statsGrid}>

        {/* TOTAL ALERTS */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(56,189,248,0.12)",
              color: "#38bdf8",
            }}
          >
            <FaBell />
          </div>

          <div>

            <div style={styles.statLabel}>
              Total Alerts
            </div>

            <div style={styles.statValue}>
              {alertChemicals.length}
            </div>

            <div style={styles.statHint}>
              Requires attention
            </div>

          </div>

        </div>


        {/* EXPIRED */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(239,68,68,0.12)",
              color: "#f87171",
            }}
          >
            <FaTimesCircle />
          </div>

          <div>

            <div style={styles.statLabel}>
              Expired
            </div>

            <div style={styles.statValue}>
              {expiredCount}
            </div>

            <div style={styles.statHint}>
              Immediate action required
            </div>

          </div>

        </div>


        {/* CRITICAL */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(251,146,60,0.12)",
              color: "#fb923c",
            }}
          >
            <FaExclamationTriangle />
          </div>

          <div>

            <div style={styles.statLabel}>
              Critical
            </div>

            <div style={styles.statValue}>
              {criticalCount}
            </div>

            <div style={styles.statHint}>
              Expiring within 7 days
            </div>

          </div>

        </div>


        {/* EXPIRING SOON */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(251,191,36,0.12)",
              color: "#fbbf24",
            }}
          >
            <FaClock />
          </div>

          <div>

            <div style={styles.statLabel}>
              Expiring Soon
            </div>

            <div style={styles.statValue}>
              {soonCount}
            </div>

            <div style={styles.statHint}>
              Within the next 30 days
            </div>

          </div>

        </div>

      </div>


      {/* ================= MAIN PANEL ================= */}

      <div style={styles.panel}>

        {/* PANEL HEADER */}

        <div style={styles.panelHeader}>

          <div>

            <h2 style={styles.panelTitle}>
              Expiry Alert Records
            </h2>

            <p style={styles.panelSubtitle}>
              Chemicals requiring expiry
              monitoring and action
            </p>

          </div>


          <div style={styles.controls}>

            {/* SEARCH */}

            <div style={styles.searchBox}>

              <FaSearch
                style={styles.searchIcon}
              />

              <input
                type="text"
                placeholder="Search chemicals..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={styles.searchInput}
              />

            </div>


            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              style={styles.select}
            >
              <option value="All">
                All Alerts
              </option>

              <option value="Expired">
                Expired
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="Expiring Soon">
                Expiring Soon
              </option>

            </select>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}


        {/* ================= TABLE ================= */}

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  Chemical
                </th>

                <th style={styles.th}>
                  Formula
                </th>

                <th style={styles.th}>
                  Category
                </th>

                <th style={styles.th}>
                  Quantity
                </th>

                <th style={styles.th}>
                  Storage Location
                </th>

                <th style={styles.th}>
                  Expiry Date
                </th>

                <th style={styles.th}>
                  Days Left
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "center",
                  }}
                >
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredChemicals.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    style={styles.emptyCell}
                  >

                    <div
                      style={styles.emptyIcon}
                    >
                      <FaCheckCircle />
                    </div>

                    <h3
                      style={styles.emptyTitle}
                    >
                      No Expiry Alerts
                    </h3>

                    <p
                      style={styles.emptyText}
                    >
                      Great! No chemicals are
                      currently expiring within
                      the next 30 days.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredChemicals.map(
                  (chemical) => {

                    const days =
                      getDaysLeft(
                        chemical.expiry
                      );

                    const status =
                      getStatus(
                        chemical.expiry
                      );

                    return (

                      <tr
                        key={chemical.id}
                        style={styles.row}
                      >

                        {/* CHEMICAL */}

                        <td style={styles.td}>

                          <div
                            style={
                              styles.chemicalBox
                            }
                          >

                            <div
                              style={
                                styles.chemicalIcon
                              }
                            >
                              <FaFlask />
                            </div>

                            <div>

                              <div
                                style={
                                  styles.chemicalName
                                }
                              >
                                {chemical.name ||
                                  "Unnamed Chemical"}
                              </div>

                              <div
                                style={
                                  styles.chemicalId
                                }
                              >
                                ID:{" "}
                                {chemical.id?.slice(
                                  0,
                                  8
                                )}
                              </div>

                            </div>

                          </div>

                        </td>


                        {/* FORMULA */}

                        <td style={styles.td}>

                          <span
                            style={
                              styles.formula
                            }
                          >
                            {chemical.formula ||
                              "—"}
                          </span>

                        </td>


                        {/* CATEGORY */}

                        <td style={styles.td}>

                          <span
                            style={
                              styles.categoryBadge
                            }
                          >
                            {chemical.category ||
                              "General"}
                          </span>

                        </td>


                        {/* QUANTITY */}

                        <td style={styles.td}>

                          <strong
                            style={
                              styles.quantity
                            }
                          >
                            {chemical.quantity ?? 0}
                          </strong>

                          <span
                            style={
                              styles.unit
                            }
                          >
                            {" "}
                            {chemical.unit ||
                              "units"}
                          </span>

                        </td>


                        {/* LOCATION */}

                        <td style={styles.td}>

                          <div
                            style={
                              styles.location
                            }
                          >

                            <FaMapMarkerAlt />

                            {chemical.location ||
                              "Not specified"}

                          </div>

                        </td>


                        {/* EXPIRY DATE */}

                        <td style={styles.td}>

                          <div
                            style={
                              styles.dateBox
                            }
                          >

                            <FaCalendarAlt />

                            {formatDate(
                              chemical.expiry
                            )}

                          </div>

                        </td>


                        {/* DAYS LEFT */}

                        <td style={styles.td}>

                          <div
                            style={{
                              ...styles.daysBox,

                              ...(days < 0
                                ? styles.daysExpired
                                : days <= 7
                                ? styles.daysCritical
                                : styles.daysWarning),
                            }}
                          >

                            {days < 0
                              ? `${Math.abs(
                                  days
                                )} days ago`
                              : days === 0
                              ? "Today"
                              : `${days} days`}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span
                            style={{
                              ...styles.statusBadge,

                              ...(status.type ===
                              "expired"
                                ? styles.statusExpired
                                : status.type ===
                                  "critical"
                                ? styles.statusCritical
                                : status.type ===
                                  "warning"
                                ? styles.statusWarning
                                : styles.statusSafe),
                            }}
                          >

                            <span
                              style={
                                styles.statusDot
                              }
                            />

                            {status.label}

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div style={styles.footer}>

          <div style={styles.footerText}>
            Showing{" "}

            <strong>
              {filteredChemicals.length}
            </strong>

            {" "}of{" "}

            <strong>
              {alertChemicals.length}
            </strong>

            {" "}expiry alerts
          </div>


          <div style={styles.footerAlert}>

            <FaExclamationTriangle />

            Chemicals with expired or
            upcoming expiry dates require
            regular monitoring.

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================
   STYLES
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    padding: "42px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #07111f 0%, #0b1b33 45%, #0d2445 100%)",
    color: "#f8fafc",
    fontFamily:
      "'Inter', 'Poppins', Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    padding: 0,
    marginBottom: "22px",
    cursor: "pointer",
    fontSize: "13px",
  },

  pageLabel: {
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "750",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
    maxWidth: "600px",
    lineHeight: "1.6",
  },

  alertIconBox: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(239,68,68,0.12))",
    border:
      "1px solid rgba(251,191,36,0.2)",
    color: "#fbbf24",
    fontSize: "23px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.9))",
    border:
      "1px solid rgba(148,163,184,0.13)",
    borderRadius: "18px",
    padding: "21px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.14)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "5px",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: "27px",
    fontWeight: "750",
    lineHeight: "1",
  },

  statHint: {
    color: "#64748b",
    fontSize: "10px",
    marginTop: "7px",
  },

  panel: {
    background:
      "rgba(15,23,42,0.72)",
    backdropFilter: "blur(18px)",
    border:
      "1px solid rgba(148,163,184,0.12)",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.2)",
  },

  panelHeader: {
    padding: "24px",
    borderBottom:
      "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "43px",
    padding: "0 13px",
    borderRadius: "11px",
    background:
      "rgba(30,41,59,0.8)",
    border:
      "1px solid rgba(148,163,184,0.15)",
  },

  searchIcon: {
    color: "#64748b",
    fontSize: "14px",
  },

  searchInput: {
    width: "190px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#f8fafc",
    fontSize: "13px",
  },

  select: {
    height: "43px",
    padding: "0 13px",
    borderRadius: "11px",
    background: "#1e293b",
    border:
      "1px solid rgba(148,163,184,0.15)",
    color: "#cbd5e1",
    outline: "none",
    fontSize: "13px",
    cursor: "pointer",
  },

  errorBox: {
    margin: "18px 24px",
    padding: "13px",
    borderRadius: "10px",
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1250px",
    borderCollapse: "collapse",
  },

  th: {
    padding: "15px 20px",
    textAlign: "left",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
    background:
      "rgba(2,6,23,0.28)",
    whiteSpace: "nowrap",
  },

  row: {
    borderTop:
      "1px solid rgba(148,163,184,0.07)",
  },

  td: {
    padding: "18px 20px",
    color: "#cbd5e1",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  chemicalBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  chemicalIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(251,191,36,0.1)",
    color: "#fbbf24",
  },

  chemicalName: {
    color: "#f1f5f9",
    fontSize: "13px",
    fontWeight: "650",
  },

  chemicalId: {
    color: "#64748b",
    fontSize: "10px",
    marginTop: "4px",
  },

  formula: {
    fontFamily: "monospace",
    color: "#94a3b8",
    background:
      "rgba(148,163,184,0.07)",
    padding: "6px 8px",
    borderRadius: "6px",
  },

  categoryBadge: {
    padding: "6px 10px",
    borderRadius: "7px",
    color: "#93c5fd",
    background:
      "rgba(59,130,246,0.1)",
    fontSize: "11px",
    fontWeight: "600",
  },

  quantity: {
    color: "#f1f5f9",
  },

  unit: {
    color: "#64748b",
    fontSize: "11px",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#94a3b8",
  },

  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
  },

  daysBox: {
    display: "inline-flex",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "650",
  },

  daysExpired: {
    color: "#f87171",
    background:
      "rgba(239,68,68,0.1)",
  },

  daysCritical: {
    color: "#fb923c",
    background:
      "rgba(249,115,22,0.1)",
  },

  daysWarning: {
    color: "#fbbf24",
    background:
      "rgba(251,191,36,0.1)",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "650",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "currentColor",
  },

  statusExpired: {
    color: "#f87171",
    background:
      "rgba(239,68,68,0.1)",
  },

  statusCritical: {
    color: "#fb923c",
    background:
      "rgba(249,115,22,0.1)",
  },

  statusWarning: {
    color: "#fbbf24",
    background:
      "rgba(251,191,36,0.1)",
  },

  statusSafe: {
    color: "#4ade80",
    background:
      "rgba(34,197,94,0.1)",
  },

  emptyCell: {
    textAlign: "center",
    padding: "80px 20px",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 17px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(34,197,94,0.12)",
    color: "#4ade80",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: 0,
    color: "#f1f5f9",
    fontSize: "18px",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "9px",
    lineHeight: "1.6",
  },

  footer: {
    padding: "17px 22px",
    borderTop:
      "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  footerText: {
    color: "#64748b",
    fontSize: "12px",
  },

  footerAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "11px",
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#07111f,#0d2445)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  loader: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border:
      "4px solid rgba(255,255,255,0.12)",
    borderTop:
      "4px solid #fbbf24",
    animation:
      "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "15px",
    color: "#94a3b8",
  },

};

export default ExpiryAlerts;