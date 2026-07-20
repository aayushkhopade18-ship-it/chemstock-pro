import { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import EditChemicalModal from "../components/EditChemicalModal";
import InventoryToolbar from "../components/InventoryToolbar";
import { ChemicalContext } from "../context/ChemicalContext";

function Inventory() {
  const { chemicals, deleteChemical, updateChemical } =
    useContext(ChemicalContext);

  const role = localStorage.getItem("role");

  const [search, setSearch] = useState("");
  const [selectedChemical, setSelectedChemical] = useState(null);

  const filteredChemicals = chemicals.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.formula.toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 style={{ marginBottom: "20px" }}>
          🧪 Chemical Inventory
        </h1>

        <InventoryToolbar
          chemicals={chemicals}
          search={search}
          setSearch={setSearch}
        />

        <div
          style={{
            background: "#1e293b",
            borderRadius: "20px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead style={{ background: "#334155" }}>
              <tr>
                <th style={th}>Chemical</th>
                <th style={th}>Formula</th>
                <th style={th}>Category</th>
                <th style={th}>Quantity</th>
                <th style={th}>Unit</th>
                <th style={th}>Location</th>
                <th style={th}>Expiry</th>
                <th style={th}>Supplier</th>

                {role !== "student" && (
                  <th style={th}>Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredChemicals.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.formula}</td>
                  <td style={td}>{item.category || "-"}</td>
                  <td style={td}>{item.quantity}</td>
                  <td style={td}>{item.unit}</td>
                  <td style={td}>{item.location}</td>
                  <td style={td}>{item.expiry}</td>
                  <td style={td}>{item.supplier}</td>

                  {role !== "student" && (
                    <td style={td}>
                      <button
                        onClick={() => setSelectedChemical(item)}
                        style={editBtn}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this chemical?"
                            )
                          ) {
                            deleteChemical(item.id);
                          }
                        }}
                        style={deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filteredChemicals.length === 0 && (
                <tr>
                  <td
                    colSpan={role === "student" ? 8 : 9}
                    style={{
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    No Chemicals Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {role !== "student" && (
        <EditChemicalModal
          chemical={selectedChemical}
          onClose={() => setSelectedChemical(null)}
          onSave={updateChemical}
        />
      )}
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

const editBtn = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Inventory;