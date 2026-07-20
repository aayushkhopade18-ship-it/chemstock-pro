import Sidebar from "../components/Sidebar";
import { FaBoxes } from "react-icons/fa";

function LowStock() {
  const chemicals = [
    {
      id: 1,
      name: "Hydrochloric Acid",
      quantity: "100 mL",
      minimum: "500 mL",
      location: "Shelf A1",
      status: "🔴 Reorder Immediately",
    },
    {
      id: 2,
      name: "Sodium Hydroxide",
      quantity: "250 g",
      minimum: "1 Kg",
      location: "Shelf B2",
      status: "🟠 Low Stock",
    },
    {
      id: 3,
      name: "Silver Nitrate",
      quantity: "50 g",
      minimum: "250 g",
      location: "Shelf D4",
      status: "🔴 Critical",
    },
    {
      id: 4,
      name: "Phenolphthalein",
      quantity: "80 mL",
      minimum: "500 mL",
      location: "Shelf C3",
      status: "🟠 Low Stock",
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
          <FaBoxes /> Low Stock Chemicals
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
                <th style={th}>Current Stock</th>
                <th style={th}>Minimum Stock</th>
                <th style={th}>Location</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {chemicals.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.quantity}</td>
                  <td style={td}>{item.minimum}</td>
                  <td style={td}>{item.location}</td>
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

export default LowStock;