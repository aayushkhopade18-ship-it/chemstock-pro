import React, { useContext, useMemo, useState } from "react";

import {
  FaExclamationTriangle,
  FaSearch,
  FaFlask,
  FaBoxOpen,
  FaArrowUp,
  FaMapMarkerAlt,
  FaTag,
  FaChartLine,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

import { ChemicalContext } from "../context/ChemicalContext";

function LowStock() {
  const { chemicals, loading } =
    useContext(ChemicalContext);

  const [search, setSearch] = useState("");

  /* =========================
     LOW STOCK CALCULATION
  ========================= */

  const getStockStatus = (chemical) => {
    const quantity = Number(
      chemical.quantity || 0
    );

    const threshold = Number(
      chemical.lowStockThreshold ||
        chemical.reorderLevel ||
        10
    );

    if (quantity <= 0) {
      return {
        text: "Out of Stock",
        type: "critical",
        color: "#f87171",
      };
    }

    if (quantity <= threshold * 0.5) {
      return {
        text: "Critical",
        type: "critical",
        color: "#f87171",
      };
    }

    if (quantity <= threshold) {
      return {
        text: "Low Stock",
        type: "warning",
        color: "#fbbf24",
      };
    }

    return {
      text: "Healthy",
      type: "healthy",
      color: "#4ade80",
    };
  };

  /* =========================
     LOW STOCK CHEMICALS
  ========================= */

  const lowStockChemicals = useMemo(() => {
    return chemicals.filter((chemical) => {
      const quantity = Number(
        chemical.quantity || 0
      );

      const threshold = Number(
        chemical.lowStockThreshold ||
          chemical.reorderLevel ||
          10
      );

      return quantity <= threshold;
    });
  }, [chemicals]);

  /* =========================
     FILTER SEARCH
  ========================= */

  const filteredChemicals = useMemo(() => {
    const searchText = search.toLowerCase();

    return lowStockChemicals.filter(
      (chemical) =>
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
          .includes(searchText)
    );
  }, [lowStockChemicals, search]);

  /* =========================
     STATS
  ========================= */

  const criticalStock =
    lowStockChemicals.filter((chemical) => {
      const quantity = Number(
        chemical.quantity || 0
      );

      const threshold = Number(
        chemical.lowStockThreshold ||
          chemical.reorderLevel ||
          10
      );

      return (
        quantity <= 0 ||
        quantity <= threshold * 0.5
      );
    }).length;

  const lowStockCount =
    lowStockChemicals.filter((chemical) => {
      const quantity = Number(
        chemical.quantity || 0
      );

      const threshold = Number(
        chemical.lowStockThreshold ||
          chemical.reorderLevel ||
          10
      );

      return (
        quantity > threshold * 0.5 &&
        quantity <= threshold
      );
    }).length;

  const healthyStock =
    chemicals.length -
    lowStockChemicals.length;

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
          Checking inventory stock levels...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}

      <div style={styles.header}>
        <div>
          <div style={styles.pageLabel}>
            INVENTORY MONITORING
          </div>

          <h1 style={styles.title}>
            Low Stock Alerts
          </h1>

          <p style={styles.subtitle}>
            Monitor chemicals that require
            restocking
          </p>
        </div>

        <div style={styles.alertBadge}>
          <FaExclamationTriangle />

          <div>
            <span style={styles.alertLabel}>
              ATTENTION REQUIRED
            </span>

            <strong style={styles.alertNumber}>
              {lowStockChemicals.length}
            </strong>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(248,113,113,0.12)",
              color: "#f87171",
            }}
          >
            <FaTimesCircle />
          </div>

          <div>
            <div style={styles.statLabel}>
              Critical Stock
            </div>

            <div style={styles.statValue}>
              {criticalStock}
            </div>

            <div style={styles.statHint}>
              Immediate attention
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(251,191,36,0.12)",
              color: "#fbbf24",
            }}
          >
            <FaExclamationTriangle />
          </div>

          <div>
            <div style={styles.statLabel}>
              Low Stock
            </div>

            <div style={styles.statValue}>
              {lowStockCount}
            </div>

            <div style={styles.statHint}>
              Reorder recommended
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(74,222,128,0.12)",
              color: "#4ade80",
            }}
          >
            <FaCheckCircle />
          </div>

          <div>
            <div style={styles.statLabel}>
              Healthy Stock
            </div>

            <div style={styles.statValue}>
              {healthyStock}
            </div>

            <div style={styles.statHint}>
              Sufficient inventory
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(96,165,250,0.12)",
              color: "#60a5fa",
            }}
          >
            <FaFlask />
          </div>

          <div>
            <div style={styles.statLabel}>
              Total Chemicals
            </div>

            <div style={styles.statValue}>
              {chemicals.length}
            </div>

            <div style={styles.statHint}>
              Inventory records
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALERT BANNER ================= */}

      {criticalStock > 0 && (
        <div style={styles.criticalBanner}>
          <div style={styles.bannerIcon}>
            <FaExclamationTriangle />
          </div>

          <div>
            <h3 style={styles.bannerTitle}>
              Critical inventory attention required
            </h3>

            <p style={styles.bannerText}>
              {criticalStock} chemical
              {criticalStock !== 1 ? "s are" : " is"}{" "}
              at critically low stock levels or
              completely out of stock.
            </p>
          </div>
        </div>
      )}

      {/* ================= INVENTORY PANEL ================= */}

      <div style={styles.inventoryPanel}>
        <div style={styles.panelTop}>
          <div>
            <h2 style={styles.panelTitle}>
              Chemicals Requiring Restock
            </h2>

            <p style={styles.panelSubtitle}>
              {filteredChemicals.length} low stock
              chemical
              {filteredChemicals.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />

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
        </div>

        {/* ================= TABLE ================= */}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Chemical
                </th>

                <th style={styles.th}>
                  Category
                </th>

                <th style={styles.th}>
                  Current Stock
                </th>

                <th style={styles.th}>
                  Stock Level
                </th>

                <th style={styles.th}>
                  Location
                </th>

                <th style={styles.th}>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredChemicals.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={styles.emptyCell}
                  >
                    <div style={styles.emptyIcon}>
                      <FaCheckCircle />
                    </div>

                    <h3 style={styles.emptyTitle}>
                      All stock levels are healthy
                    </h3>

                    <p style={styles.emptyText}>
                      No chemicals currently require
                      restocking.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredChemicals.map(
                  (chemical) => {
                    const status =
                      getStockStatus(chemical);

                    const quantity = Number(
                      chemical.quantity || 0
                    );

                    const threshold = Number(
                      chemical.lowStockThreshold ||
                        chemical.reorderLevel ||
                        10
                    );

                    const percentage =
                      threshold > 0
                        ? Math.min(
                            (quantity /
                              threshold) *
                              100,
                            100
                          )
                        : 0;

                    return (
                      <tr
                        key={chemical.id}
                        style={styles.row}
                      >
                        {/* CHEMICAL */}

                        <td style={styles.td}>
                          <div
                            style={
                              styles.chemicalNameBox
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
                                  styles.formula
                                }
                              >
                                {chemical.formula ||
                                  "Formula unavailable"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td style={styles.td}>
                          <span
                            style={
                              styles.categoryBadge
                            }
                          >
                            <FaTag />

                            {chemical.category ||
                              "General"}
                          </span>
                        </td>

                        {/* QUANTITY */}

                        <td style={styles.td}>
                          <div
                            style={
                              styles.quantityBox
                            }
                          >
                            <strong
                              style={{
                                color:
                                  status.color,
                              }}
                            >
                              {quantity}{" "}
                              {chemical.unit ||
                                "units"}
                            </strong>

                            <span
                              style={
                                styles.thresholdText
                              }
                            >
                              Alert below{" "}
                              {threshold}{" "}
                              {chemical.unit ||
                                "units"}
                            </span>
                          </div>
                        </td>

                        {/* STOCK BAR */}

                        <td style={styles.td}>
                          <div
                            style={
                              styles.stockLevel
                            }
                          >
                            <div
                              style={
                                styles.stockBar
                              }
                            >
                              <div
                                style={{
                                  ...styles.stockFill,
                                  width: `${percentage}%`,
                                  background:
                                    status.color,
                                }}
                              />
                            </div>

                            <span
                              style={{
                                ...styles.percentage,
                                color:
                                  status.color,
                              }}
                            >
                              {Math.round(
                                percentage
                              )}
                              %
                            </span>
                          </div>
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

                        {/* STATUS */}

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,

                              color:
                                status.color,

                              background:
                                status.type ===
                                "critical"
                                  ? "rgba(248,113,113,0.1)"
                                  : "rgba(251,191,36,0.1)",
                            }}
                          >
                            <span
                              style={
                                styles.statusDot
                              }
                            />

                            {status.text}
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

        {/* ================= FOOTER ================= */}

        <div style={styles.tableFooter}>
          <div style={styles.recordText}>
            Showing{" "}
            <strong>
              {filteredChemicals.length}
            </strong>{" "}
            chemicals requiring attention
          </div>

          <div style={styles.footerInfo}>
            <FaChartLine />

            Inventory levels update automatically
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
    gap: "20px",
    marginBottom: "32px",
    flexWrap: "wrap",
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
    fontSize: "36px",
    fontWeight: "750",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
  },

  alertBadge: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "14px 20px",
    borderRadius: "15px",
    background:
      "rgba(251,191,36,0.08)",
    border:
      "1px solid rgba(251,191,36,0.18)",
    color: "#fbbf24",
  },

  alertLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    letterSpacing: "1px",
    fontWeight: "700",
  },

  alertNumber: {
    display: "block",
    fontSize: "23px",
    color: "#f8fafc",
    marginTop: "3px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: "18px",
    marginBottom: "25px",
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
    flexShrink: 0,
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "4px",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: "26px",
    fontWeight: "750",
  },

  statHint: {
    color: "#64748b",
    fontSize: "10px",
    marginTop: "3px",
  },

  criticalBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 22px",
    marginBottom: "25px",
    borderRadius: "17px",
    background:
      "linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
    border:
      "1px solid rgba(248,113,113,0.2)",
  },

  bannerIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background:
      "rgba(248,113,113,0.15)",
    color: "#f87171",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  bannerTitle: {
    margin: 0,
    color: "#fecaca",
    fontSize: "14px",
  },

  bannerText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  inventoryPanel: {
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

  panelTop: {
    padding: "24px",
    borderBottom:
      "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
  },

  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background:
      "rgba(30,41,59,0.8)",
    border:
      "1px solid rgba(148,163,184,0.15)",
    borderRadius: "11px",
    padding: "0 14px",
    height: "43px",
    minWidth: "230px",
  },

  searchIcon: {
    color: "#64748b",
    fontSize: "14px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#f8fafc",
    width: "100%",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
  },

  th: {
    textAlign: "left",
    padding: "15px 22px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    background:
      "rgba(2,6,23,0.25)",
  },

  row: {
    borderTop:
      "1px solid rgba(148,163,184,0.07)",
  },

  td: {
    padding: "18px 22px",
    fontSize: "13px",
    color: "#cbd5e1",
  },

  chemicalNameBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  chemicalIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background:
      "rgba(251,191,36,0.1)",
    color: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chemicalName: {
    color: "#f1f5f9",
    fontWeight: "650",
    fontSize: "13px",
  },

  formula: {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "4px",
    fontFamily: "monospace",
  },

  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#93c5fd",
    background:
      "rgba(59,130,246,0.1)",
    padding: "7px 10px",
    borderRadius: "7px",
    fontSize: "11px",
    fontWeight: "600",
  },

  quantityBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  thresholdText: {
    color: "#64748b",
    fontSize: "10px",
  },

  stockLevel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "150px",
  },

  stockBar: {
    width: "95px",
    height: "7px",
    background:
      "rgba(148,163,184,0.13)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  stockFill: {
    height: "100%",
    borderRadius: "20px",
    transition: "0.3s",
  },

  percentage: {
    fontSize: "11px",
    fontWeight: "700",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "650",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "currentColor",
  },

  tableFooter: {
    padding: "17px 22px",
    borderTop:
      "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  recordText: {
    color: "#64748b",
    fontSize: "12px",
  },

  footerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    fontSize: "11px",
  },

  emptyCell: {
    textAlign: "center",
    padding: "75px 20px",
  },

  emptyIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    background:
      "rgba(74,222,128,0.1)",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: 0,
    color: "#f1f5f9",
    fontSize: "17px",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "8px",
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
    borderTop: "4px solid #fbbf24",
  },

  loadingText: {
    marginTop: "15px",
    color: "#94a3b8",
  },
};

export default LowStock;