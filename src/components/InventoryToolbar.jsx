import { exportInventoryToExcel } from "../utils/exportExcel";
import { exportInventoryToPDF } from "../utils/pdfExport";

function InventoryToolbar({ chemicals, search, setSearch }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search chemical..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          flex: 1,
          minWidth: "280px",
          padding: "13px",
          borderRadius: "10px",
          border: "none",
          fontSize: "16px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => exportInventoryToExcel(chemicals)}
          style={btnGreen}
        >
          📥 Excel
        </button>

        <button
          onClick={() => exportInventoryToPDF(chemicals)}
          style={btnBlue}
        >
          📄 PDF
        </button>

        <button
          onClick={() => window.location.reload()}
          style={btnOrange}
        >
          🔄 Refresh
        </button>

        <button
          onClick={() => window.print()}
          style={btnPurple}
        >
          🖨 Print
        </button>
      </div>
    </div>
  );
}

const btnGreen = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnBlue = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnOrange = {
  background: "#f59e0b",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnPurple = {
  background: "#7c3aed",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default InventoryToolbar;