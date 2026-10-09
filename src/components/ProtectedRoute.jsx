import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const {
    user,
    role,
    loading,
  } = useAuth();

  const location = useLocation();

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0f172a",
          color: "#ffffff",
          fontSize: "18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading ChemStock Pro...
      </div>
    );
  }

  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /* =========================
     NORMALIZE ROLE
  ========================= */

  const normalizedRole = String(role || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  /* =========================
     ADMIN + ASSISTANT
     SAME ACCESS
  ========================= */

  const hasFullAccess =
    normalizedRole === "admin" ||
    normalizedRole === "assistant" ||
    normalizedRole === "lab_assistant";

  /* =========================
     NORMALIZE ALLOWED ROLES
  ========================= */

  const normalizedAllowedRoles =
    allowedRoles.map((item) =>
      String(item)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
    );

  /* =========================
     NO ROLE RESTRICTION
  ========================= */

  if (normalizedAllowedRoles.length === 0) {
    return children;
  }

  /* =========================
     ADMIN + ASSISTANT
     ALWAYS FULL ACCESS
  ========================= */

  if (hasFullAccess) {
    return children;
  }

  /* =========================
     STUDENT / OTHER ROLE CHECK
  ========================= */

  if (
    !normalizedAllowedRoles.includes(
      normalizedRole
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;