import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddChemical from "./pages/AddChemical";
import IssueChemical from "./pages/IssueChemical";
import IssueRegister from "./pages/IssueRegister";
import ExpiryAlerts from "./pages/ExpiryAlerts";
import LowStock from "./pages/LowStock";

function Reports() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "40px",
        fontWeight: "bold",
      }}
    >
      📊 Reports (Coming Soon)
    </div>
  );
}

function Settings() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "40px",
        fontWeight: "bold",
      }}
    >
      ⚙️ Settings (Coming Soon)
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  if (role === null) return null;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant", "student"]}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant", "student"]}
          >
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/addchemical"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant"]}
          >
            <AddChemical />
          </ProtectedRoute>
        }
      />

      <Route
        path="/issuechemical"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant"]}
          >
            <IssueChemical />
          </ProtectedRoute>
        }
      />

      <Route
        path="/issueregister"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant"]}
          >
            <IssueRegister />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expiryalerts"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant"]}
          >
            <ExpiryAlerts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lowstock"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant"]}
          >
            <LowStock />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "assistant", "student"]}
          >
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;