import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { ChemicalContext } from "../context/ChemicalContext";
import { IssueContext } from "../context/IssueContext";
import {
  FaFlask,
  FaBoxes,
  FaExclamationTriangle,
  FaClock,
  FaClipboardList,
  FaCube,
} from "react-icons/fa";

function Dashboard() {
  const { chemicals } = useContext(ChemicalContext);
  const { issues } = useContext(IssueContext);

  const totalChemicals = chemicals.length;

  const totalQuantity = chemicals.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalIssues = issues.length;

  const lowStock = chemicals.filter(
    (item) => Number(item.quantity) <= 2
  ).length;

  const today = new Date();

  const expiringSoon = chemicals.filter((item) => {
    if (!item.expiry) return false;

    const expiry = new Date(item.expiry);

    const diff =
      (expiry - today) / (1000 * 60 * 60 * 24);

    return diff <= 30 && diff >= 0;
  }).length;

  const totalShelves = new Set(
    chemicals.map((item) => item.location)
  ).size;

  const card = {
    background: "#1e293b",
    borderRadius: "18px",
    padding: "25px",
    color: "white",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
  };

  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: "260px",
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0f172a,#2563eb)",
          padding: "40px",
          color: "white",
          fontFamily: "Poppins,sans-serif",
        }}
      >
        <h1>📊 Dashboard</h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "35px",
            fontSize: "18px",
          }}
        >
          Welcome to ChemStock Pro Laboratory Management System
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          <div style={card}>
            <FaFlask size={40} color="#22c55e" />
            <h2>{totalChemicals}</h2>
            <p>Total Chemicals</p>
          </div>

          <div style={card}>
            <FaCube size={40} color="#06b6d4" />
            <h2>{totalQuantity}</h2>
            <p>Total Quantity</p>
          </div>

          <div style={card}>
            <FaClipboardList size={40} color="#a855f7" />
            <h2>{totalIssues}</h2>
            <p>Total Issues</p>
          </div>

          <div style={card}>
            <FaBoxes size={40} color="#3b82f6" />
            <h2>{totalShelves}</h2>
            <p>Storage Shelves</p>
          </div>

          <div style={card}>
            <FaExclamationTriangle size={40} color="#f59e0b" />
            <h2>{lowStock}</h2>
            <p>Low Stock</p>
          </div>

          <div style={card}>
            <FaClock size={40} color="#ef4444" />
            <h2>{expiringSoon}</h2>
            <p>Expiring Soon</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            background: "#1e293b",
            borderRadius: "20px",
            padding: "25px",
          }}
        >
          <h2>🧪 Recently Added Chemicals</h2>

          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#334155",
                }}
              >
                <th style={th}>Chemical</th>
                <th style={th}>Formula</th>
                <th style={th}>Quantity</th>
                <th style={th}>Supplier</th>
              </tr>
            </thead>

            <tbody>
              {chemicals.slice(-5).reverse().map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.formula}</td>
                  <td style={td}>
                    {item.quantity} {item.unit}
                  </td>
                  <td style={td}>{item.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const th = {
  padding: "15px",
  textAlign: "left",
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #334155",
};

export default Dashboard;