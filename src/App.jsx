import React, { useState, useContext, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  FaFlask,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaSearch,
  FaSignOutAlt,
  FaCheckCircle,
  FaBoxes,
} from "react-icons/fa";

import { useAuth } from "./context/AuthContext";
import { ChemicalContext } from "./context/ChemicalContext";

// Components & Pages
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddChemical from "./pages/AddChemical";
import IssueChemical from "./pages/IssueChemical";
import IssueRegister from "./pages/IssueRegister";
import Reports from "./pages/Reports";
import LabCopilot from "./pages/LabCopilot";
import Suppliers from "./pages/Suppliers";
import Instruments from "./pages/Instruments";

/* =========================================================
   INLINE VIEWS (Guaranteed compilation)
========================================================= */
function ExpiryAlertsView() {
  const { chemicals = [] } = useContext(ChemicalContext);

  const getDaysLeft = (expiry) => {
    if (!expiry) return null;
    const parts = expiry.split("-");
    let exp;
    if (parts.length === 3) {
      exp = parts[0].length === 4
        ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        : new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      exp = new Date(expiry);
    }
    if (isNaN(exp.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  };

  const flagged = useMemo(() => {
    return chemicals
      .map((c) => ({ ...c, daysLeft: getDaysLeft(c.expiry) }))
      .filter((c) => c.daysLeft !== null && c.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));
  }, [chemicals]);

  return (
    <div style={sharedStyles.page}>
      <h1 style={sharedStyles.title}>Expiry Alerts</h1>
      <p style={sharedStyles.sub}>Chemicals expired or expiring within 30 days</p>

      <div style={sharedStyles.card}>
        <table style={sharedStyles.table}>
          <thead>
            <tr>
              <th style={sharedStyles.th}>CHEMICAL</th>
              <th style={sharedStyles.th}>FORMULA</th>
              <th style={sharedStyles.th}>STOCK</th>
              <th style={sharedStyles.th}>LOCATION</th>
              <th style={sharedStyles.th}>EXPIRY DATE</th>
              <th style={sharedStyles.th}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {flagged.length === 0 ? (
              <tr>
                <td colSpan="6" style={sharedStyles.empty}>
                  ✅ All chemical inventory items have valid shelf life.
                </td>
              </tr>
            ) : (
              flagged.map((c) => {
                const isExpired = c.daysLeft < 0;
                return (
                  <tr key={c.id} style={sharedStyles.tr}>
                    <td style={{ ...sharedStyles.td, fontWeight: "700" }}>{c.name}</td>
                    <td style={{ ...sharedStyles.td, color: "#38bdf8", fontFamily: "monospace" }}>
                      {c.formula || "—"}
                    </td>
                    <td style={sharedStyles.td}>{c.quantity} {c.unit}</td>
                    <td style={sharedStyles.td}>{c.location || "Main Cabinet"}</td>
                    <td style={sharedStyles.td}>{c.expiry}</td>
                    <td style={sharedStyles.td}>
                      <span
                        style={{
                          ...sharedStyles.pill,
                          background: isExpired ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                          color: isExpired ? "#f87171" : "#fbbf24",
                        }}
                      >
                        {isExpired ? `Expired (${Math.abs(c.daysLeft)}d ago)` : `${c.daysLeft} days left`}
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
  );
}

function LowStockView() {
  const { chemicals = [] } = useContext(ChemicalContext);

  const lowStockItems = useMemo(() => {
    return chemicals.filter((c) => {
      const q = Number(c.quantity);
      const min = Number(c.minimumStock || c.minStock || 0);
      return !isNaN(q) && min > 0 && q <= min;
    });
  }, [chemicals]);

  return (
    <div style={sharedStyles.page}>
      <h1 style={sharedStyles.title}>Low Stock Reorder List</h1>
      <p style={sharedStyles.sub}>Chemicals at or below minimum threshold</p>

      <div style={sharedStyles.card}>
        <table style={sharedStyles.table}>
          <thead>
            <tr>
              <th style={sharedStyles.th}>CHEMICAL</th>
              <th style={sharedStyles.th}>CURRENT QUANTITY</th>
              <th style={sharedStyles.th}>MINIMUM THRESHOLD</th>
              <th style={sharedStyles.th}>LOCATION</th>
              <th style={sharedStyles.th}>SUPPLIER</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
              <tr>
                <td colSpan="5" style={sharedStyles.empty}>
                  ✅ All chemicals are adequately stocked above alert cutoffs.
                </td>
              </tr>
            ) : (
              lowStockItems.map((c) => (
                <tr key={c.id} style={sharedStyles.tr}>
                  <td style={{ ...sharedStyles.td, fontWeight: "700" }}>{c.name}</td>
                  <td style={{ ...sharedStyles.td, color: "#f87171", fontWeight: "700" }}>
                    {c.quantity} {c.unit}
                  </td>
                  <td style={sharedStyles.td}>{c.minimumStock || c.minStock} {c.unit}</td>
                  <td style={sharedStyles.td}>{c.location || "Main Cabinet"}</td>
                  <td style={{ ...sharedStyles.td, color: "#38bdf8" }}>{c.supplier || "Vendor Directory"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchView() {
  const { chemicals = [] } = useContext(ChemicalContext);
  const [query, setQuery] = useState("");

  const filtered = chemicals.filter(
    (c) =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.formula?.toLowerCase().includes(query.toLowerCase()) ||
      c.category?.toLowerCase().includes(query.toLowerCase()) ||
      c.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={sharedStyles.page}>
      <h1 style={sharedStyles.title}>Global Chemical Search</h1>
      <p style={sharedStyles.sub}>Search active inventory by name, formula, category or storage location</p>

      <div style={{ position: "relative", marginBottom: "20px", maxWidth: "600px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search e.g. Acetone, NaCl, Acid, Shelf 2..."
          style={sharedStyles.searchBar}
          autoFocus
        />
        <FaSearch style={{ position: "absolute", right: "16px", top: "16px", color: "#64748b" }} />
      </div>

      <div style={sharedStyles.card}>
        <table style={sharedStyles.table}>
          <thead>
            <tr>
              <th style={sharedStyles.th}>CHEMICAL</th>
              <th style={sharedStyles.th}>FORMULA</th>
              <th style={sharedStyles.th}>CATEGORY</th>
              <th style={sharedStyles.th}>STOCK</th>
              <th style={sharedStyles.th}>LOCATION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={sharedStyles.empty}>No chemicals match your search query.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} style={sharedStyles.tr}>
                  <td style={{ ...sharedStyles.td, fontWeight: "700" }}>{c.name}</td>
                  <td style={{ ...sharedStyles.td, color: "#38bdf8", fontFamily: "monospace" }}>{c.formula || "—"}</td>
                  <td style={sharedStyles.td}>{c.category || "General"}</td>
                  <td style={sharedStyles.td}>{c.quantity} {c.unit}</td>
                  <td style={sharedStyles.td}>{c.location || "Main Cabinet"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView() {
  const { user, userData, collegeId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={sharedStyles.page}>
      <h1 style={sharedStyles.title}>Laboratory Settings</h1>
      <p style={sharedStyles.sub}>Campus configuration, administrative profile, and system status</p>

      <div style={{ ...sharedStyles.card, maxWidth: "600px" }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>CURRENT CAMPUS</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#38bdf8", marginTop: "4px" }}>
            {collegeId ? collegeId.toUpperCase().replace("_", " ") : "MAIN CAMPUS"}
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>LOGGED IN ACCOUNT</div>
          <div style={{ fontSize: "15px", color: "#f8fafc", marginTop: "4px" }}>
            {user?.email || "User"}
          </div>
        </div>

        <div style={{ marginBottom: "26px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>SECURITY ACCESS ROLE</div>
          <div style={{ fontSize: "14px", color: "#34d399", fontWeight: "700", marginTop: "4px" }}>
            {userData?.role?.toUpperCase() || "STUDENT"}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            background: "rgba(239, 68, 68, 0.18)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          <FaSignOutAlt /> Sign Out of System
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ROUTING GUARDS
========================================================= */
// Available to all logged-in accounts (Students + Staff)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={sharedStyles.loading}>
        <div style={{ color: "#38bdf8", fontSize: "18px", fontWeight: "700" }}>
          Loading ChemStock Pro...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={sharedStyles.layout}>
      <Sidebar />
      <main style={sharedStyles.mainArea}>{children}</main>
    </div>
  );
}

// STRICT GUARD: Only Admin and Faculty can access (Blocks Students)
function StaffOnlyRoute({ children }) {
  const { user, loading, hasFullAccess, role } = useAuth();

  if (loading) {
    return (
      <div style={sharedStyles.loading}>
        <div style={{ color: "#38bdf8", fontSize: "18px", fontWeight: "700" }}>
          Verifying Permissions...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isStaff = hasFullAccess || role === "admin" || role === "faculty";

  // If a student tries to access add-chemical or issue-chemical, redirect them to inventory
  if (!isStaff) {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <div style={sharedStyles.layout}>
      <Sidebar />
      <main style={sharedStyles.mainArea}>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={sharedStyles.loading}>
        <div style={{ color: "#38bdf8", fontSize: "18px", fontWeight: "700" }}>
          Loading ChemStock Pro...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Public Login */}
      <Route path="/login" element={<Login />} />

      {/* Read-Only Routes for All Users (including Students) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/instruments" element={<ProtectedRoute><Instruments /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchView /></ProtectedRoute>} />
      <Route path="/expiry-alerts" element={<ProtectedRoute><ExpiryAlertsView /></ProtectedRoute>} />
      <Route path="/expiry" element={<ProtectedRoute><ExpiryAlertsView /></ProtectedRoute>} />
      <Route path="/low-stock" element={<ProtectedRoute><LowStockView /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />

      {/* STAFF ONLY: Students are blocked from adding or issuing chemicals */}
      <Route path="/add-chemical" element={<StaffOnlyRoute><AddChemical /></StaffOnlyRoute>} />
      <Route path="/issue-chemical" element={<StaffOnlyRoute><IssueChemical /></StaffOnlyRoute>} />
      <Route path="/issue-register" element={<StaffOnlyRoute><IssueRegister /></StaffOnlyRoute>} />
      <Route path="/reports" element={<StaffOnlyRoute><Reports /></StaffOnlyRoute>} />
      <Route path="/lab-copilot" element={<StaffOnlyRoute><LabCopilot /></StaffOnlyRoute>} />
      <Route path="/suppliers" element={<StaffOnlyRoute><Suppliers /></StaffOnlyRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

const sharedStyles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "#071126",
  },
  mainArea: {
    marginLeft: "260px",
    width: "calc(100% - 260px)",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  page: {
    minHeight: "100vh",
    padding: "36px 45px",
    background: "linear-gradient(135deg, #071126 0%, #0B1E42 45%, #102A63 100%)",
    color: "#FFFFFF",
    fontFamily: "'Inter', Arial, sans-serif",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
  },
  sub: {
    margin: "6px 0 24px 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  card: {
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "18px",
    padding: "24px",
    backdropFilter: "blur(14px)",
  },
  searchBar: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(15,23,42,0.8)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px 14px",
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "700",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  tr: {
    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },
  td: {
    padding: "14px",
    fontSize: "13px",
    color: "#e2e8f0",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "14px",
    fontSize: "11px",
    fontWeight: "700",
  },
  loading: {
    minHeight: "100vh",
    background: "#071126",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
};