import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaFlask,
  FaExclamationTriangle,
  FaClipboardList,
  FaBoxes,
  FaArrowRight,
  FaPlus,
  FaMicroscope,
  FaChartBar,
  FaRobot,
  FaCalendarAlt,
  FaArrowUp,
  FaShieldAlt,
  FaCheckCircle,
  FaBolt,
  FaLayerGroup,
  FaClock,
} from "react-icons/fa";

import { ChemicalContext } from "../context/ChemicalContext";
import { IssueContext } from "../context/IssueContext";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();

  const { chemicals = [] } =
    useContext(ChemicalContext);

  const { issues = [] } =
    useContext(IssueContext);

  const { userData } = useAuth();

  /* =========================
     DATE
  ========================= */

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  /* =========================
     EXPIRY CALCULATION
  ========================= */

  const getDaysLeft = (expiry) => {
    if (!expiry) return null;

    const parts = expiry.split("-");

    let expiryDate;

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        expiryDate = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
      } else {
        expiryDate = new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );
      }
    } else {
      expiryDate = new Date(expiry);
    }

    if (isNaN(expiryDate.getTime())) {
      return null;
    }

    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (expiryDate - currentDate) /
        (1000 * 60 * 60 * 24)
    );
  };

  /* =========================
     EXPIRING SOON
  ========================= */

  const expiringSoon = chemicals.filter(
    (chemical) => {
      const days = getDaysLeft(
        chemical.expiry
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 30
      );
    }
  );

  /* =========================
     LOW STOCK
  ========================= */

  const lowStockChemicals =
    chemicals.filter((chemical) => {
      const quantity = Number(
        chemical.quantity
      );

      const minimum = Number(
        chemical.minimumStock ??
          chemical.minStock ??
          chemical.minimum ??
          0
      );

      return (
        !isNaN(quantity) &&
        minimum > 0 &&
        quantity <= minimum
      );
    });

  /* =========================
     DASHBOARD STATS
  ========================= */

  const cards = [
    {
      title: "Total Chemicals",
      value: chemicals.length,
      description: "Registered inventory",
      icon: <FaFlask />,
      path: "/inventory",
      color: "#38BDF8",
      glow: "rgba(56,189,248,0.18)",
    },

    {
      title: "Expiring Soon",
      value: expiringSoon.length,
      description: "Next 30 days",
      icon: <FaExclamationTriangle />,
      path: "/expiry-alerts",
      color: "#FBBF24",
      glow: "rgba(251,191,36,0.18)",
    },

    {
      title: "Total Issues",
      value: issues.length,
      description: "Issued chemicals",
      icon: <FaClipboardList />,
      path: "/issue-register",
      color: "#A78BFA",
      glow: "rgba(167,139,250,0.18)",
    },

    {
      title: "Low Stock",
      value: lowStockChemicals.length,
      description: "Need attention",
      icon: <FaBoxes />,
      path: "/low-stock",
      color: "#FB7185",
      glow: "rgba(251,113,133,0.18)",
    },
  ];

  /* =========================
     QUICK ACTIONS
  ========================= */

  const actions = [
    {
      title: "Add Chemical",
      subtitle: "Register new inventory",
      icon: <FaPlus />,
      path: "/add-chemical",
      color: "#38BDF8",
    },

    {
      title: "Issue Chemical",
      subtitle: "Record chemical usage",
      icon: <FaArrowUp />,
      path: "/issue-chemical",
      color: "#A78BFA",
    },

    {
      title: "Instruments",
      subtitle: "Manage laboratory equipment",
      icon: <FaMicroscope />,
      path: "/instruments",
      color: "#34D399",
    },

    {
      title: "Reports",
      subtitle: "View laboratory analytics",
      icon: <FaChartBar />,
      path: "/reports",
      color: "#FBBF24",
    },

    {
      title: "Lab Copilot",
      subtitle: "AI laboratory assistant",
      icon: <FaRobot />,
      path: "/lab-copilot",
      color: "#60A5FA",
    },
  ];

  return (
    <div style={styles.page}>

      {/* BACKGROUND EFFECTS */}

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div style={styles.gridOverlay} />


      {/* =========================
          TOP HEADER
      ========================= */}

      <div style={styles.topbar}>

        <div>

          <div style={styles.systemLabel}>
            <span style={styles.liveDot} />
            LABORATORY COMMAND CENTER
          </div>

          <h1 style={styles.title}>
            Welcome back,{" "}
            <span style={styles.nameHighlight}>
              {userData?.name || "Admin"}
            </span>
          </h1>

          <p style={styles.subtitle}>
            Monitor your laboratory inventory,
            chemical activity and operational status.
          </p>

        </div>


        <div style={styles.dateBox}>

          <div style={styles.dateIcon}>
            <FaCalendarAlt />
          </div>

          <div>

            <div style={styles.dateLabel}>
              TODAY
            </div>

            <div style={styles.dateText}>
              {today}
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          HERO STATUS
      ========================= */}

      <div style={styles.hero}>

        <div style={styles.heroGlow} />

        <div style={styles.heroContent}>

          <div style={styles.heroBadge}>
            <FaBolt />
            LIVE LAB STATUS
          </div>

          <h2 style={styles.heroTitle}>
            Your laboratory is{" "}
            <span>under control.</span>
          </h2>

          <p style={styles.heroText}>
            Real-time visibility into inventory,
            chemical availability and laboratory
            operations.
          </p>

          <div style={styles.heroButtons}>

            <button
              onClick={() =>
                navigate("/add-chemical")
              }
              style={styles.primaryButton}
            >
              <FaPlus />
              Add Chemical
            </button>

            <button
              onClick={() =>
                navigate("/inventory")
              }
              style={styles.secondaryButton}
            >
              View Inventory
              <FaArrowRight />
            </button>

          </div>

        </div>


        <div style={styles.heroStats}>

          <div style={styles.heroStat}>

            <div style={styles.heroStatIcon}>
              <FaLayerGroup />
            </div>

            <div>

              <div style={styles.heroStatNumber}>
                {chemicals.length}
              </div>

              <div style={styles.heroStatText}>
                Inventory Items
              </div>

            </div>

          </div>


          <div style={styles.heroDivider} />


          <div style={styles.heroStat}>

            <div
              style={{
                ...styles.heroStatIcon,
                color: "#A78BFA",
              }}
            >
              <FaClipboardList />
            </div>

            <div>

              <div style={styles.heroStatNumber}>
                {issues.length}
              </div>

              <div style={styles.heroStatText}>
                Issue Records
              </div>

            </div>

          </div>


          <div style={styles.heroDivider} />


          <div style={styles.heroStat}>

            <div
              style={{
                ...styles.heroStatIcon,
                color:
                  lowStockChemicals.length > 0
                    ? "#FB7185"
                    : "#34D399",
              }}
            >
              <FaShieldAlt />
            </div>

            <div>

              <div
                style={{
                  ...styles.heroStatNumber,
                  fontSize: "20px",
                }}
              >
                {lowStockChemicals.length > 0
                  ? "Attention"
                  : "Healthy"}
              </div>

              <div style={styles.heroStatText}>
                Inventory Status
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          SECTION TITLE
      ========================= */}

      <div style={styles.sectionHeader}>

        <div>

          <div style={styles.sectionLabel}>
            OVERVIEW
          </div>

          <h2 style={styles.sectionTitle}>
            Laboratory Intelligence
          </h2>

        </div>

        <div style={styles.realTime}>

          <FaClock />

          <span>
            Real-time data
          </span>

        </div>

      </div>


      {/* =========================
          MAIN STAT CARDS
      ========================= */}

      <div style={styles.cardGrid}>

        {cards.map((card) => (

          <div
            key={card.title}
            onClick={() =>
              navigate(card.path)
            }
            style={styles.statCard}
          >

            <div
              style={{
                ...styles.cardGlow,
                background: card.glow,
              }}
            />

            <div style={styles.cardTop}>

              <div
                style={{
                  ...styles.cardIcon,
                  color: card.color,
                  background: card.glow,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  ...styles.cardLine,
                  background: card.color,
                }}
              />

            </div>


            <div style={styles.cardNumber}>
              {card.value}
            </div>

            <div style={styles.cardTitle}>
              {card.title}
            </div>

            <div style={styles.cardDescription}>
              {card.description}
            </div>


            <div
              style={{
                ...styles.cardBottom,
                color: card.color,
              }}
            >
              Explore
              <FaArrowRight />
            </div>

          </div>

        ))}

      </div>


      {/* =========================
          MAIN LOWER GRID
      ========================= */}

      <div style={styles.lowerGrid}>


        {/* QUICK OPERATIONS */}

        <div style={styles.operationsCard}>

          <div style={styles.panelHeader}>

            <div>

              <div style={styles.sectionLabel}>
                OPERATIONS
              </div>

              <h2 style={styles.panelTitle}>
                Quick Operations
              </h2>

            </div>

            <div style={styles.panelBadge}>
              {actions.length} TOOLS
            </div>

          </div>


          <div style={styles.actionList}>

            {actions.map((action) => (

              <button
                key={action.title}
                onClick={() =>
                  navigate(action.path)
                }
                style={styles.actionItem}
              >

                <div
                  style={{
                    ...styles.actionIcon,
                    color: action.color,
                  }}
                >
                  {action.icon}
                </div>

                <div style={styles.actionInfo}>

                  <div style={styles.actionTitle}>
                    {action.title}
                  </div>

                  <div style={styles.actionSubtitle}>
                    {action.subtitle}
                  </div>

                </div>

                <FaArrowRight
                  style={styles.actionArrow}
                />

              </button>

            ))}

          </div>

        </div>


        {/* LAB HEALTH */}

        <div style={styles.healthCard}>

          <div style={styles.healthTop}>

            <div>

              <div style={styles.sectionLabel}>
                SYSTEM HEALTH
              </div>

              <h2 style={styles.panelTitle}>
                Laboratory Status
              </h2>

            </div>


            <div style={styles.healthCircle}>

              <div style={styles.healthInner}>
                <FaCheckCircle />
              </div>

            </div>

          </div>


          <div style={styles.healthMessage}>

            <div style={styles.healthStatus}>
              SYSTEM OPERATIONAL
            </div>

            <div style={styles.healthDescription}>
              ChemStock Pro services are
              running normally.
            </div>

          </div>


          <div style={styles.healthMetrics}>

            <div style={styles.metric}>

              <span>
                Inventory
              </span>

              <strong>
                {chemicals.length}
              </strong>

            </div>

            <div style={styles.metric}>

              <span>
                Alerts
              </span>

              <strong
                style={{
                  color:
                    expiringSoon.length > 0
                      ? "#FBBF24"
                      : "#34D399",
                }}
              >
                {expiringSoon.length}
              </strong>

            </div>

            <div style={styles.metric}>

              <span>
                Stock Risk
              </span>

              <strong
                style={{
                  color:
                    lowStockChemicals.length > 0
                      ? "#FB7185"
                      : "#34D399",
                }}
              >
                {lowStockChemicals.length}
              </strong>

            </div>

          </div>


          <div style={styles.systemRows}>

            <div style={styles.systemRow}>

              <div style={styles.systemLeft}>
                <span
                  style={styles.greenDot}
                />

                Inventory Database
              </div>

              <span style={styles.online}>
                ONLINE
              </span>

            </div>


            <div style={styles.systemRow}>

              <div style={styles.systemLeft}>
                <span
                  style={styles.greenDot}
                />

                Issue Tracking
              </div>

              <span style={styles.online}>
                ACTIVE
              </span>

            </div>


            <div style={styles.systemRow}>

              <div style={styles.systemLeft}>
                <span
                  style={
                    expiringSoon.length > 0 ||
                    lowStockChemicals.length > 0
                      ? styles.orangeDot
                      : styles.greenDot
                  }
                />

                Inventory Monitoring
              </div>

              <span
                style={
                  expiringSoon.length > 0 ||
                  lowStockChemicals.length > 0
                    ? styles.warning
                    : styles.online
                }
              >
                {expiringSoon.length > 0 ||
                lowStockChemicals.length > 0
                  ? "REVIEW"
                  : "GOOD"}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          ATTENTION PANEL
      ========================= */}

      {(expiringSoon.length > 0 ||
        lowStockChemicals.length > 0) && (

        <div style={styles.alertPanel}>

          <div style={styles.alertLeft}>

            <div style={styles.alertIcon}>
              <FaExclamationTriangle />
            </div>

            <div>

              <div style={styles.alertTitle}>
                Laboratory Attention Required
              </div>

              <div style={styles.alertText}>

                {expiringSoon.length > 0 &&
                  `${expiringSoon.length} chemical${
                    expiringSoon.length > 1
                      ? "s"
                      : ""
                  } approaching expiry`}

                {expiringSoon.length > 0 &&
                  lowStockChemicals.length > 0 &&
                  "  •  "}

                {lowStockChemicals.length > 0 &&
                  `${lowStockChemicals.length} item${
                    lowStockChemicals.length > 1
                      ? "s"
                      : ""
                  } running low`}

              </div>

            </div>

          </div>


          <button
            onClick={() =>
              navigate(
                expiringSoon.length > 0
                  ? "/expiry-alerts"
                  : "/low-stock"
              )
            }
            style={styles.reviewButton}
          >
            Review Alerts
            <FaArrowRight />
          </button>

        </div>

      )}

    </div>
  );
}


/* =========================
   PREMIUM BLUE UI STYLES
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    padding: "42px",
    boxSizing: "border-box",
    color: "#FFFFFF",

    background:
      "linear-gradient(135deg, #071126 0%, #0B1E42 45%, #102A63 100%)",

    fontFamily:
      "'Inter', 'Poppins', Arial, sans-serif",
  },


  /* BACKGROUND */

  glowOne: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,0.20), transparent 70%)",
    top: "-250px",
    right: "-100px",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(56,189,248,0.12), transparent 70%)",
    bottom: "-200px",
    left: "15%",
    pointerEvents: "none",
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    opacity: 0.035,

    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",

    backgroundSize:
      "40px 40px",

    pointerEvents: "none",
  },


  /* HEADER */

  topbar: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "28px",
  },

  systemLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#60A5FA",
    fontWeight: "700",
    marginBottom: "12px",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22C55E",
    boxShadow:
      "0 0 12px #22C55E",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "750",
    letterSpacing: "-1.2px",
    color: "#F8FAFC",
  },

  nameHighlight: {
    background:
      "linear-gradient(90deg,#38BDF8,#60A5FA)",

    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "#94A3B8",
    fontSize: "14px",
  },

  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "12px 15px",
    background:
      "rgba(15, 36, 78, 0.65)",
    border:
      "1px solid rgba(96,165,250,0.15)",
    borderRadius: "13px",
    backdropFilter: "blur(12px)",
  },

  dateIcon: {
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    background:
      "rgba(59,130,246,0.15)",
    color: "#60A5FA",
  },

  dateLabel: {
    fontSize: "9px",
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  dateText: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#CBD5E1",
    fontWeight: "600",
  },


  /* HERO */

  hero: {
    position: "relative",
    zIndex: 1,
    overflow: "hidden",

    padding: "30px",

    borderRadius: "22px",

    background:
      "linear-gradient(120deg, rgba(20,55,115,0.95), rgba(13,34,76,0.95))",

    border:
      "1px solid rgba(96,165,250,0.18)",

    boxShadow:
      "0 25px 70px rgba(0,0,0,0.25)",

    marginBottom: "34px",
  },

  heroGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    right: "-100px",
    top: "-180px",

    background:
      "radial-gradient(circle, rgba(37,99,235,0.32), transparent 70%)",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "620px",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",

    padding: "7px 11px",

    borderRadius: "30px",

    background:
      "rgba(56,189,248,0.1)",

    border:
      "1px solid rgba(56,189,248,0.18)",

    color: "#38BDF8",

    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  heroTitle: {
    margin: "17px 0 8px",
    fontSize: "31px",
    letterSpacing: "-1px",
    fontWeight: "750",
  },

  heroText: {
    margin: 0,
    maxWidth: "580px",
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "22px",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",

    padding: "11px 17px",

    border: "none",
    borderRadius: "9px",

    background:
      "linear-gradient(135deg,#2563EB,#38BDF8)",

    color: "white",

    fontWeight: "700",
    fontSize: "12px",

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(37,99,235,0.28)",
  },

  secondaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",

    padding: "11px 17px",

    borderRadius: "9px",

    background:
      "rgba(255,255,255,0.04)",

    border:
      "1px solid rgba(255,255,255,0.1)",

    color: "#CBD5E1",

    fontWeight: "600",
    fontSize: "12px",

    cursor: "pointer",
  },

  heroStats: {
    position: "relative",
    zIndex: 1,

    display: "flex",
    alignItems: "center",
    gap: "25px",

    marginTop: "30px",
    paddingTop: "22px",

    borderTop:
      "1px solid rgba(255,255,255,0.07)",
  },

  heroStat: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  heroStatIcon: {
    color: "#38BDF8",
    fontSize: "19px",
  },

  heroStatNumber: {
    fontSize: "22px",
    fontWeight: "750",
    color: "#F8FAFC",
  },

  heroStatText: {
    marginTop: "3px",
    fontSize: "10px",
    color: "#64748B",
  },

  heroDivider: {
    height: "35px",
    width: "1px",
    background:
      "rgba(255,255,255,0.1)",
  },


  /* SECTION */

  sectionHeader: {
    position: "relative",
    zIndex: 1,

    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",

    marginBottom: "18px",
  },

  sectionLabel: {
    color: "#38BDF8",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "7px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "700",
    color: "#F8FAFC",
  },

  realTime: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748B",
    fontSize: "10px",
  },


  /* STAT CARDS */

  cardGrid: {
    position: "relative",
    zIndex: 1,

    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "16px",

    marginBottom: "25px",
  },

  statCard: {
    position: "relative",
    overflow: "hidden",

    padding: "20px",

    minHeight: "185px",

    borderRadius: "17px",

    cursor: "pointer",

    background:
      "linear-gradient(145deg, rgba(20,48,100,0.88), rgba(10,27,62,0.9))",

    border:
      "1px solid rgba(148,163,184,0.1)",

    transition:
      "transform 0.25s ease, border 0.25s ease",

    boxSizing: "border-box",
  },

  cardGlow: {
    position: "absolute",
    width: "120px",
    height: "120px",

    borderRadius: "50%",

    filter: "blur(30px)",

    right: "-50px",
    top: "-50px",
  },

  cardTop: {
    position: "relative",
    zIndex: 1,

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardIcon: {
    width: "43px",
    height: "43px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "12px",

    fontSize: "17px",
  },

  cardLine: {
    width: "30px",
    height: "3px",
    borderRadius: "5px",
    opacity: 0.7,
  },

  cardNumber: {
    position: "relative",
    zIndex: 1,

    marginTop: "23px",

    fontSize: "32px",
    fontWeight: "750",
    color: "#F8FAFC",
  },

  cardTitle: {
    position: "relative",
    zIndex: 1,

    marginTop: "5px",

    color: "#CBD5E1",
    fontSize: "13px",
    fontWeight: "650",
  },

  cardDescription: {
    position: "relative",
    zIndex: 1,

    marginTop: "4px",

    color: "#64748B",
    fontSize: "10px",
  },

  cardBottom: {
    position: "relative",
    zIndex: 1,

    display: "flex",
    alignItems: "center",
    gap: "7px",

    marginTop: "16px",

    fontSize: "10px",
    fontWeight: "650",
  },


  /* LOWER GRID */

  lowerGrid: {
    position: "relative",
    zIndex: 1,

    display: "grid",

    gridTemplateColumns:
      "1.25fr 0.75fr",

    gap: "18px",
  },

  operationsCard: {
    padding: "23px",

    borderRadius: "18px",

    background:
      "rgba(10,27,62,0.72)",

    border:
      "1px solid rgba(148,163,184,0.1)",
  },

  healthCard: {
    padding: "23px",

    borderRadius: "18px",

    background:
      "linear-gradient(145deg, rgba(20,57,100,0.75), rgba(8,24,55,0.85))",

    border:
      "1px solid rgba(96,165,250,0.12)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#F8FAFC",
  },

  panelBadge: {
    padding: "5px 9px",

    borderRadius: "20px",

    background:
      "rgba(56,189,248,0.08)",

    color: "#38BDF8",

    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },


  /* ACTIONS */

  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  actionItem: {
    width: "100%",

    display: "flex",
    alignItems: "center",

    gap: "13px",

    padding: "11px",

    background:
      "rgba(255,255,255,0.025)",

    border:
      "1px solid rgba(255,255,255,0.05)",

    borderRadius: "11px",

    cursor: "pointer",

    textAlign: "left",
  },

  actionIcon: {
    width: "37px",
    height: "37px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "9px",

    background:
      "rgba(255,255,255,0.04)",

    fontSize: "14px",
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    color: "#E2E8F0",
    fontSize: "12px",
    fontWeight: "650",
  },

  actionSubtitle: {
    color: "#64748B",
    fontSize: "10px",
    marginTop: "3px",
  },

  actionArrow: {
    color: "#475569",
    fontSize: "11px",
  },


  /* HEALTH */

  healthTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  healthCircle: {
    width: "55px",
    height: "55px",

    borderRadius: "50%",

    padding: "3px",

    background:
      "linear-gradient(135deg,#22C55E,#38BDF8)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  healthInner: {
    width: "100%",
    height: "100%",

    borderRadius: "50%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "#0B1E42",

    color: "#34D399",
    fontSize: "20px",
  },

  healthMessage: {
    marginTop: "20px",
  },

  healthStatus: {
    color: "#34D399",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  healthDescription: {
    color: "#94A3B8",
    fontSize: "11px",
    marginTop: "5px",
  },

  healthMetrics: {
    display: "grid",

    gridTemplateColumns:
      "repeat(3,1fr)",

    gap: "8px",

    marginTop: "20px",
  },

  metric: {
    padding: "11px 7px",

    textAlign: "center",

    borderRadius: "9px",

    background:
      "rgba(255,255,255,0.035)",

    border:
      "1px solid rgba(255,255,255,0.04)",
  },

  metric: {
    padding: "11px 7px",
    textAlign: "center",
    borderRadius: "9px",
    background:
      "rgba(255,255,255,0.035)",
  },

  systemRows: {
    marginTop: "17px",
  },

  systemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    padding: "9px 0",

    borderBottom:
      "1px solid rgba(255,255,255,0.05)",

    fontSize: "10px",
  },

  systemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "7px",

    color: "#94A3B8",
  },

  greenDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    background: "#22C55E",

    boxShadow:
      "0 0 8px rgba(34,197,94,0.7)",
  },

  orangeDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    background: "#F59E0B",

    boxShadow:
      "0 0 8px rgba(245,158,11,0.7)",
  },

  online: {
    color: "#34D399",
    fontSize: "9px",
    fontWeight: "700",
  },

  warning: {
    color: "#FBBF24",
    fontSize: "9px",
    fontWeight: "700",
  },


  /* ALERT */

  alertPanel: {
    position: "relative",
    zIndex: 1,

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    gap: "20px",

    marginTop: "18px",

    padding: "17px 20px",

    borderRadius: "14px",

    background:
      "linear-gradient(90deg, rgba(251,146,60,0.12), rgba(251,191,36,0.05))",

    border:
      "1px solid rgba(251,191,36,0.15)",
  },

  alertLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  alertIcon: {
    width: "38px",
    height: "38px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "10px",

    background:
      "rgba(251,191,36,0.12)",

    color: "#FBBF24",
  },

  alertTitle: {
    color: "#FDE68A",
    fontSize: "12px",
    fontWeight: "700",
  },

  alertText: {
    color: "#94A3B8",
    fontSize: "10px",
    marginTop: "4px",
  },

  reviewButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",

    padding: "10px 14px",

    border: "none",

    borderRadius: "8px",

    background:
      "linear-gradient(135deg,#D97706,#F59E0B)",

    color: "#FFFFFF",

    fontSize: "11px",
    fontWeight: "700",

    cursor: "pointer",
  },

};

export default Dashboard;