import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaClipboardList,
  FaSearch,
  FaFlask,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaCheckCircle,
} from "react-icons/fa";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function IssueRegister() {
  const { collegeId, loading: authLoading } = useAuth();

  const [issueRecords, setIssueRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =========================
     LOAD ISSUE RECORDS FROM FIRESTORE
  ========================= */

  useEffect(() => {
    if (authLoading) return;

    if (!collegeId) {
      setIssueRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listens directly to colleges/{collegeId}/issues
    const issuesRef = collection(db, "colleges", collegeId, "issues");

    const unsubscribe = onSnapshot(
      issuesRef,
      (snapshot) => {
        try {
          const records = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          // Sort by date descending (newest first) in memory to avoid index requirements
          records.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.issueDate || a.issuedAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.issueDate || b.issuedAt || 0);
            return dateB - dateA;
          });

          setIssueRecords(records);
          setLoading(false);
        } catch (error) {
          console.error("Error loading issue records:", error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Firestore Issue Register Error:", error);
        // Fallback to localStorage if offline
        const localRecords = JSON.parse(localStorage.getItem("chemicalIssueRecords")) || [];
        setIssueRecords(localRecords);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collegeId, authLoading]);

  /* =========================
     NORMALIZE DATA
  ========================= */

  const normalizedIssues = useMemo(() => {
    return issueRecords.map((issue, index) => {
      // Resolve Firestore timestamp if present
      let resolvedDate = issue.issueDate || issue.date || issue.issuedAt || "";
      if (issue.createdAt?.toDate) {
        resolvedDate = issue.createdAt.toDate().toISOString();
      }

      return {
        id: issue.id || `ISS-${index + 1}`,
        chemicalName:
          issue.chemicalName ||
          issue.name ||
          issue.chemical?.name ||
          "Unknown Chemical",
        formula:
          issue.formula ||
          issue.chemicalFormula ||
          issue.chemical?.formula ||
          "—",
        quantity:
          issue.quantity ??
          issue.issuedQuantity ??
          issue.qty ??
          0,
        unit:
          issue.unit ||
          issue.chemicalUnit ||
          "units",
        issuedTo:
          issue.issuedTo ||
          issue.receiver ||
          issue.recipient ||
          issue.personName ||
          "Not specified",
        department:
          issue.department ||
          issue.departmentName ||
          issue.lab ||
          "Not specified",
        purpose:
          issue.purpose ||
          issue.reason ||
          "Laboratory use",
        issuedBy:
          issue.issuedBy ||
          issue.staffName ||
          issue.createdBy ||
          "Admin",
        date: resolvedDate,
        status: issue.status || "Issued",
      };
    });
  }, [issueRecords]);

  /* =========================
     FILTER
  ========================= */

  const filteredIssues = useMemo(() => {
    return normalizedIssues.filter((issue) => {
      const text = search.toLowerCase();

      const matchesSearch =
        issue.chemicalName?.toLowerCase().includes(text) ||
        issue.formula?.toLowerCase().includes(text) ||
        issue.issuedTo?.toLowerCase().includes(text) ||
        issue.department?.toLowerCase().includes(text) ||
        issue.purpose?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "All" || issue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [normalizedIssues, search, statusFilter]);

  /* =========================
     STATS
  ========================= */

  const totalIssues = normalizedIssues.length;

  const activeIssues = normalizedIssues.filter(
    (issue) => issue.status === "Issued"
  ).length;

  const returnedIssues = normalizedIssues.filter(
    (issue) => issue.status === "Returned"
  ).length;

  const uniqueChemicals = new Set(
    normalizedIssues.map((issue) => issue.chemicalName)
  ).size;

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================
     STATUS STYLE
  ========================= */

  const getStatusStyle = (status) => {
    if (status === "Returned") {
      return styles.returnedStatus;
    }
    if (status === "Overdue") {
      return styles.overdueStatus;
    }
    return styles.issuedStatus;
  };

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <div>
          <div style={styles.pageLabel}>LABORATORY MANAGEMENT</div>
          <h1 style={styles.title}>Chemical Issue Register</h1>
          <p style={styles.subtitle}>
            Track all chemicals issued from laboratory inventory
          </p>
        </div>

        <div style={styles.headerBadge}>
          <FaClipboardList />
          <div>
            <span style={styles.badgeLabel}>TOTAL RECORDS</span>
            <strong style={styles.badgeNumber}>{totalIssues}</strong>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaClipboardList />
          </div>
          <div>
            <div style={styles.statLabel}>Total Issues</div>
            <div style={styles.statValue}>{totalIssues}</div>
            <div style={styles.statSubtext}>All issue records</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(59,130,246,0.14)",
              color: "#60a5fa",
            }}
          >
            <FaArrowUp />
          </div>
          <div>
            <div style={styles.statLabel}>Currently Issued</div>
            <div style={styles.statValue}>{activeIssues}</div>
            <div style={styles.statSubtext}>Active issue records</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(34,197,94,0.12)",
              color: "#4ade80",
            }}
          >
            <FaCheckCircle />
          </div>
          <div>
            <div style={styles.statLabel}>Returned</div>
            <div style={styles.statValue}>{returnedIssues}</div>
            <div style={styles.statSubtext}>Completed issue records</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(167,139,250,0.12)",
              color: "#a78bfa",
            }}
          >
            <FaFlask />
          </div>
          <div>
            <div style={styles.statLabel}>Chemicals Issued</div>
            <div style={styles.statValue}>{uniqueChemicals}</div>
            <div style={styles.statSubtext}>Unique chemicals</div>
          </div>
        </div>
      </div>

      {/* ================= MAIN PANEL ================= */}
      <div style={styles.panel}>
        {/* PANEL HEADER */}
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Issued Chemical Records</h2>
            <p style={styles.panelSubtitle}>
              Complete history of chemicals issued from inventory
            </p>
          </div>

          <div style={styles.controls}>
            {/* SEARCH */}
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search chemical, person or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* FILTER */}
            <div style={styles.filterBox}>
              <FaFilter />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Status</option>
                <option value="Issued">Issued</option>
                <option value="Returned">Returned</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Chemical</th>
                <th style={styles.th}>Quantity Issued</th>
                <th style={styles.th}>Issued To</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Issued By</th>
                <th style={styles.th}>Issue Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    <p style={styles.emptyText}>Loading campus records...</p>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    <div style={styles.emptyIconBox}>
                      <FaClipboardList />
                    </div>
                    <h3 style={styles.emptyTitle}>No issue records found</h3>
                    <p style={styles.emptyText}>
                      Chemical issue records will appear here after chemicals are issued.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} style={styles.row}>
                    {/* CHEMICAL */}
                    <td style={styles.td}>
                      <div style={styles.chemicalBox}>
                        <div style={styles.chemicalIcon}>
                          <FaFlask />
                        </div>
                        <div>
                          <div style={styles.chemicalName}>
                            {issue.chemicalName}
                          </div>
                          <div style={styles.formula}>{issue.formula}</div>
                        </div>
                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td style={styles.td}>
                      <div style={styles.quantityBox}>
                        <strong style={styles.quantity}>
                          {issue.quantity}
                        </strong>
                        <span style={styles.unit}>{issue.unit}</span>
                      </div>
                    </td>

                    {/* ISSUED TO */}
                    <td style={styles.td}>
                      <div style={styles.personBox}>
                        <div style={styles.personIcon}>
                          <FaUser />
                        </div>
                        <span>{issue.issuedTo}</span>
                      </div>
                    </td>

                    {/* DEPARTMENT */}
                    <td style={styles.td}>
                      <div style={styles.departmentBox}>
                        <FaBuilding />
                        <span>{issue.department}</span>
                      </div>
                    </td>

                    {/* PURPOSE */}
                    <td style={styles.td}>
                      <span style={styles.purpose}>{issue.purpose}</span>
                    </td>

                    {/* ISSUED BY */}
                    <td style={styles.td}>
                      <span style={styles.issuedBy}>{issue.issuedBy}</span>
                    </td>

                    {/* DATE */}
                    <td style={styles.td}>
                      <div style={styles.dateBox}>
                        <FaCalendarAlt />
                        {formatDate(issue.date)}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(issue.status),
                        }}
                      >
                        <span style={styles.statusDot} />
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= FOOTER ================= */}
        <div style={styles.footer}>
          <div style={styles.recordText}>
            Showing <strong>{filteredIssues.length}</strong> of{" "}
            <strong>{totalIssues}</strong> issue records
          </div>

          <div style={styles.pagination}>
            <button style={styles.pageButton}>
              <FaChevronLeft />
            </button>
            <div style={styles.activePage}>1</div>
            <button style={styles.pageButton}>
              <FaChevronRight />
            </button>
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
    fontFamily: "'Inter', 'Poppins', Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  pageLabel: {
    color: "#38bdf8",
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
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "14px 19px",
    borderRadius: "15px",
    background: "rgba(30,41,59,0.75)",
    border: "1px solid rgba(148,163,184,0.14)",
    color: "#38bdf8",
  },
  badgeLabel: {
    display: "block",
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  badgeNumber: {
    display: "block",
    color: "#f8fafc",
    fontSize: "22px",
    marginTop: "2px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },
  statCard: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.9))",
    border: "1px solid rgba(148,163,184,0.13)",
    borderRadius: "18px",
    padding: "21px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "25px",
    fontWeight: "750",
    color: "#f8fafc",
  },
  statSubtext: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "4px",
  },
  panel: {
    background: "rgba(15,23,42,0.72)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
  },
  panelHeader: {
    padding: "24px",
    borderBottom: "1px solid rgba(148,163,184,0.1)",
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
  controls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "11px",
    padding: "0 13px",
    height: "43px",
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
    width: "230px",
    fontSize: "13px",
  },
  filterBox: {
    height: "43px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    borderRadius: "11px",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(148,163,184,0.15)",
    color: "#64748b",
  },
  select: {
    background: "transparent",
    color: "#cbd5e1",
    border: "none",
    outline: "none",
    fontSize: "13px",
    cursor: "pointer",
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
    textAlign: "left",
    padding: "15px 20px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
    background: "rgba(2,6,23,0.25)",
    whiteSpace: "nowrap",
  },
  row: {
    borderTop: "1px solid rgba(148,163,184,0.07)",
  },
  td: {
    padding: "17px 20px",
    fontSize: "13px",
    color: "#cbd5e1",
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
    background: "rgba(37,99,235,0.14)",
    color: "#60a5fa",
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
    fontSize: "10px",
    marginTop: "4px",
    fontFamily: "monospace",
  },
  quantityBox: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
  },
  quantity: {
    color: "#f8fafc",
    fontSize: "14px",
  },
  unit: {
    color: "#64748b",
    fontSize: "11px",
  },
  personBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
  },
  personIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    fontSize: "11px",
  },
  departmentBox: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  purpose: {
    color: "#94a3b8",
    fontSize: "12px",
    maxWidth: "180px",
    display: "inline-block",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  issuedBy: {
    color: "#cbd5e1",
    fontSize: "12px",
  },
  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  status: {
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
  issuedStatus: {
    color: "#60a5fa",
    background: "rgba(59,130,246,0.1)",
  },
  returnedStatus: {
    color: "#4ade80",
    background: "rgba(34,197,94,0.1)",
  },
  overdueStatus: {
    color: "#f87171",
    background: "rgba(248,113,113,0.1)",
  },
  emptyCell: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyIconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    margin: "0 auto 17px",
    background: "rgba(37,99,235,0.12)",
    color: "#60a5fa",
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
    marginTop: "9px",
  },
  footer: {
    padding: "16px 22px",
    borderTop: "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordText: {
    color: "#64748b",
    fontSize: "12px",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  pageButton: {
    width: "33px",
    height: "33px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(30,41,59,0.8)",
    color: "#94a3b8",
    cursor: "pointer",
  },
  activePage: {
    width: "33px",
    height: "33px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "white",
    fontSize: "12px",
    fontWeight: "700",
  },
};

export default IssueRegister;