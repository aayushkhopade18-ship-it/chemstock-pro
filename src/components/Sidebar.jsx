import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaFlask,
  FaClipboardList,
  FaExclamationTriangle,
  FaLayerGroup,
  FaMicroscope,
  FaSearch,
  FaPlusCircle,
  FaHandHolding,
  FaTruck,
  FaChartBar,
  FaRobot,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, userData, collegeId, role, hasFullAccess, logout } = useAuth();
  const navigate = useNavigate();

  // Bulletproof student check
  const isStudent =
    role === "student" ||
    userData?.role?.toLowerCase() === "student" ||
    user?.email?.toLowerCase().includes("student");

  const isStaff = !isStudent && (hasFullAccess || role === "admin" || role === "faculty");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userInitial = (user?.email || "U").charAt(0).toUpperCase();
  const userRole = isStudent ? "STUDENT" : (userData?.role || role || "Staff").toUpperCase();
  const campusLabel = collegeId ? collegeId.replace("_", " ") : "campus";

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBox}>
          <FaFlask style={{ color: "#ffffff", fontSize: "16px" }} />
        </div>
        <div>
          <div style={styles.brandTitle}>
            ChemStock <span style={{ color: "#38bdf8" }}>PRO</span>
          </div>
          <div style={styles.developerTag}>DESIGNED AND DEVELOPED BY</div>
          <div style={styles.authorName}>AAYUSH KHOPADE</div>
        </div>
      </div>

      <div style={styles.systemSubhead}>LAB MANAGEMENT SYSTEM</div>

      {/* User Badge */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>{userInitial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={styles.userEmail} title={user?.email || ""}>
            {user?.email || "student@chemstock.com"}
          </div>
          <div style={styles.roleBadgeContainer}>
            <span style={{ ...styles.roleBadge, color: isStudent ? "#fbbf24" : "#38bdf8" }}>
              {userRole}
            </span>
          </div>
          <div style={styles.campusText}>Campus: {campusLabel}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {/* General items visible to everyone (Students + Staff) */}
        <NavLink to="/dashboard" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaThLarge style={styles.navIcon} /> Dashboard
        </NavLink>

        <NavLink to="/inventory" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaFlask style={styles.navIcon} /> Chemical Inventory
        </NavLink>

        <NavLink to="/instruments" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaMicroscope style={styles.navIcon} /> Instruments
        </NavLink>

        <NavLink to="/search" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaSearch style={styles.navIcon} /> Search
        </NavLink>

        <NavLink to="/expiry-alerts" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaExclamationTriangle style={styles.navIcon} /> Expiry Alerts
        </NavLink>

        <NavLink to="/low-stock" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaLayerGroup style={styles.navIcon} /> Low Stock
        </NavLink>

        {/* MANAGEMENT: HIDDEN FROM STUDENTS (Visible ONLY to Staff/Admin) */}
        {isStaff && (
          <>
            <div style={styles.sectionHeader}>MANAGEMENT</div>

            <NavLink to="/add-chemical" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaPlusCircle style={styles.navIcon} /> Add Chemical
            </NavLink>

            <NavLink to="/issue-chemical" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaHandHolding style={styles.navIcon} /> Issue Chemical
            </NavLink>

            <NavLink to="/issue-register" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaClipboardList style={styles.navIcon} /> Issue Register
            </NavLink>

            <NavLink to="/suppliers" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaTruck style={styles.navIcon} /> Suppliers
            </NavLink>

            <NavLink to="/reports" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaChartBar style={styles.navIcon} /> Reports
            </NavLink>

            <NavLink to="/lab-copilot" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
              <FaRobot style={styles.navIcon} /> Lab Copilot
            </NavLink>
          </>
        )}

        <div style={styles.sectionHeader}>SYSTEM</div>
        <NavLink to="/settings" style={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
          <FaCog style={styles.navIcon} /> Settings
        </NavLink>
      </nav>

      {/* Logout */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    background: "#08142c",
    borderRight: "1px solid rgba(148,163,184,0.12)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 14px",
    boxSizing: "border-box",
    zIndex: 1000,
    overflowY: "auto",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  logoBox: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  developerTag: {
    fontSize: "8.5px",
    color: "#64748b",
    letterSpacing: "0.8px",
    marginTop: "2px",
    fontWeight: "700",
  },
  authorName: {
    fontSize: "10px",
    color: "#38bdf8",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  systemSubhead: {
    fontSize: "9.5px",
    color: "#64748b",
    letterSpacing: "1.2px",
    fontWeight: "700",
    margin: "12px 0 14px 0",
  },
  profileCard: {
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "12px",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  userEmail: {
    fontSize: "12px",
    color: "#f8fafc",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  roleBadgeContainer: {
    marginTop: "2px",
  },
  roleBadge: {
    display: "inline-block",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  campusText: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  sectionHeader: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "1px",
    margin: "14px 0 6px 12px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    color: "#94a3b8",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
  },
  navLinkActive: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
  },
  navIcon: {
    fontSize: "14px",
    flexShrink: 0,
  },
  footer: {
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid rgba(148,163,184,0.12)",
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};