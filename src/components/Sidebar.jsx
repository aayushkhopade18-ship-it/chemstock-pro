import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

import {
  FaTachometerAlt,
  FaFlask,
  FaPlusCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaBoxes,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("role");

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const menu = [
    {
      icon: <FaTachometerAlt />,
      text: "Dashboard",
      path: "/dashboard",
    },

    {
      icon: <FaFlask />,
      text: "Chemical Inventory",
      path: "/inventory",
    },

    ...(role !== "student"
      ? [
          {
            icon: <FaPlusCircle />,
            text: "Add Chemical",
            path: "/addchemical",
          },
        ]
      : []),

    ...(role !== "student"
      ? [
          {
            icon: <FaClipboardList />,
            text: "Issue Chemical",
            path: "/issuechemical",
          },
        ]
      : []),

    {
      icon: <FaClipboardList />,
      text: "Issue Register",
      path: "/issueregister",
    },

    ...(role !== "student"
      ? [
          {
            icon: <FaExclamationTriangle />,
            text: "Expiry Alerts",
            path: "/expiryalerts",
          },
        ]
      : []),

    ...(role !== "student"
      ? [
          {
            icon: <FaBoxes />,
            text: "Low Stock",
            path: "/lowstock",
          },
        ]
      : []),

    {
      icon: <FaChartBar />,
      text: "Reports",
      path: "/reports",
    },

    ...(role !== "student"
      ? [
          {
            icon: <FaCog />,
            text: "Settings",
            path: "/settings",
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "25px 15px",
        boxSizing: "border-box",
        boxShadow: "4px 0 15px rgba(0,0,0,0.3)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "35px",
          color: "#38bdf8",
          position: "sticky",
          top: 0,
          background: "#0f172a",
          paddingBottom: "20px",
          zIndex: 100,
        }}
      >
        🧪 ChemStock Pro
      </h2>

      {menu.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "15px",
            marginBottom: "10px",
            textDecoration: "none",
            color: "white",
            borderRadius: "10px",
            transition: "0.3s",
            background:
              location.pathname === item.path
                ? "#2563eb"
                : "#1e293b",
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== item.path) {
              e.currentTarget.style.background = "#2563eb";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== item.path) {
              e.currentTarget.style.background = "#1e293b";
            }
          }}
        >
          <span
            style={{
              fontSize: "20px",
              minWidth: "25px",
            }}
          >
            {item.icon}
          </span>

          <span>{item.text}</span>
        </Link>
      ))}

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "14px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        <FaSignOutAlt style={{ marginRight: "8px" }} />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;