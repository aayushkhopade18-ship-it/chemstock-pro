import Sidebar from "../components/Sidebar";
import { FaExclamationTriangle } from "react-icons/fa";

function ExpiryAlerts() {
  const chemicals = [
    {
      id: 1,
      name: "Hydrochloric Acid",
      expiry: "12-08-2026",
      days: 22,
      status: "🟡 Expiring Soon",
    },
    {
      id: 2,
      name: "Acetone",
      expiry: "25-07-2026",
      days: 4,
      status: "🔴 Urgent",
    },
    {
      id: 3,
      name: "Silver Nitrate",
      expiry: "02-09-2026",
      days: 43,
      status: "🟢 Safe",
    },
    {
      id: 4,
      name: "Nitric Acid",
      expiry: "28-07-2026",
      days: 7,
      status: "🟠 Warning",
    },
  ];

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
        <h1>
          <FaExclamationTriangle /> Expiry Alerts
        </h1>

        <div
          style={{
            background: "#1e293b",
            marginTop: "30px",
            borderRadius: "20px",
            padding: "25px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#334155",
              }}
            >
              <tr>
                <th style={th}>Chemical</th>
                <th style={th}>Expiry Date</th>
                <th style={th}>Days Left</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {chemicals.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.expiry}</td>
                  <td style={td}>{item.days}</td>
                  <td style={td}>{item.status}</td>
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

export default ExpiryAlerts;