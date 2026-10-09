import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChemicalContext } from "../context/ChemicalContext";

function SearchChemical() {
  const { chemicals } = useContext(ChemicalContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredChemicals = chemicals.filter((chemical) => {
    const text = search.toLowerCase().trim();

    if (!text) return false;

    return (
      (chemical.name || "")
        .toLowerCase()
        .includes(text) ||
      (chemical.formula || "")
        .toLowerCase()
        .includes(text) ||
      (chemical.category || "")
        .toLowerCase()
        .includes(text) ||
      (chemical.location || "")
        .toLowerCase()
        .includes(text) ||
      (chemical.supplier || "")
        .toLowerCase()
        .includes(text)
    );
  });

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            🔍 Search Chemical
          </h1>

          <p style={styles.subtitle}>
            Quickly find chemicals in your laboratory inventory
          </p>
        </div>

        <button
          onClick={() => navigate("/inventory")}
          style={styles.inventoryButton}
        >
          🧪 View Inventory
        </button>
      </div>


      {/* SEARCH BOX */}

      <div style={styles.searchCard}>

        <h2 style={styles.searchTitle}>
          Find a Chemical
        </h2>

        <p style={styles.searchSubtitle}>
          Search by chemical name, formula, category,
          location or supplier.
        </p>

        <div style={styles.searchRow}>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="🔍 Type chemical name, formula, category..."
            style={styles.input}
            autoFocus
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              style={styles.clearButton}
            >
              ✕ Clear
            </button>
          )}

        </div>

      </div>


      {/* RESULTS */}

      <div style={styles.resultsCard}>

        <div style={styles.resultsHeader}>

          <div>
            <h2 style={styles.resultsTitle}>
              Search Results
            </h2>

            <p style={styles.resultsSubtitle}>
              {search
                ? `${filteredChemicals.length} matching chemical${
                    filteredChemicals.length !== 1
                      ? "s"
                      : ""
                  } found`
                : `Total chemicals in inventory: ${chemicals.length}`}
            </p>
          </div>

          {search && (
            <div style={styles.resultBadge}>
              {filteredChemicals.length} Results
            </div>
          )}

        </div>


        {/* NO SEARCH */}

        {!search && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              🔍
            </div>

            <h3>
              Start searching
            </h3>

            <p>
              Enter a chemical name, formula,
              category, location or supplier above.
            </p>
          </div>
        )}


        {/* NO RESULTS */}

        {search &&
          filteredChemicals.length === 0 && (
            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                ❌
              </div>

              <h3>
                No chemicals found
              </h3>

              <p>
                No chemical matches "
                <strong>{search}</strong>".
              </p>

              <button
                onClick={() =>
                  navigate("/inventory")
                }
                style={styles.secondaryButton}
              >
                View Full Inventory
              </button>

            </div>
          )}


        {/* RESULTS TABLE */}

        {search &&
          filteredChemicals.length > 0 && (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr style={styles.headRow}>

                    <th style={th}>
                      Chemical
                    </th>

                    <th style={th}>
                      Formula
                    </th>

                    <th style={th}>
                      Category
                    </th>

                    <th style={th}>
                      Quantity
                    </th>

                    <th style={th}>
                      Unit
                    </th>

                    <th style={th}>
                      Location
                    </th>

                    <th style={th}>
                      Expiry
                    </th>

                    <th style={th}>
                      Supplier
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredChemicals.map(
                    (chemical) => (

                      <tr
                        key={chemical.id}
                        style={styles.row}
                      >

                        <td style={td}>
                          <strong>
                            🧪 {chemical.name || "-"}
                          </strong>
                        </td>

                        <td style={td}>
                          {chemical.formula || "-"}
                        </td>

                        <td style={td}>
                          <span
                            style={styles.categoryBadge}
                          >
                            {chemical.category ||
                              "Uncategorized"}
                          </span>
                        </td>

                        <td
                          style={{
                            ...td,
                            fontWeight: "700",
                            color: "#38bdf8",
                          }}
                        >
                          {chemical.quantity ?? "0"}
                        </td>

                        <td style={td}>
                          {chemical.unit || "-"}
                        </td>

                        <td style={td}>
                          📍{" "}
                          {chemical.location ||
                            "Not recorded"}
                        </td>

                        <td style={td}>
                          {chemical.expiry || "-"}
                        </td>

                        <td style={td}>
                          🏢{" "}
                          {chemical.supplier || "-"}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>


      {/* QUICK LINKS */}

      <div style={styles.quickCard}>

        <h2 style={styles.quickTitle}>
          Quick Actions
        </h2>

        <div style={styles.quickButtons}>

          <button
            onClick={() =>
              navigate("/add-chemical")
            }
            style={styles.quickButton}
          >
            ＋ Add Chemical
          </button>

          <button
            onClick={() =>
              navigate("/inventory")
            }
            style={styles.quickButton}
          >
            📦 Chemical Inventory
          </button>

          <button
            onClick={() =>
              navigate("/expiry-alerts")
            }
            style={styles.quickButton}
          >
            ⏰ Expiry Alerts
          </button>

          <button
            onClick={() =>
              navigate("/low-stock")
            }
            style={styles.quickButton}
          >
            ⚠️ Low Stock
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================
   STYLES
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    width: "100%",
    padding: "40px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg,#0f172a,#2563eb)",
    color: "white",
    fontFamily:
      "Poppins, Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "8px",
    color: "#cbd5e1",
    fontSize: "15px",
  },

  inventoryButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "13px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  searchCard: {
    background:
      "rgba(15,23,42,0.92)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.22)",
  },

  searchTitle: {
    margin: 0,
    fontSize: "21px",
  },

  searchSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "6px",
  },

  searchRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  input: {
    flex: 1,
    padding: "15px 17px",
    borderRadius: "10px",
    border:
      "1px solid #475569",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },

  clearButton: {
    padding: "0 18px",
    border: "none",
    borderRadius: "10px",
    background: "#475569",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },

  resultsCard: {
    background:
      "rgba(15,23,42,0.92)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.22)",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  resultsTitle: {
    margin: 0,
    fontSize: "21px",
  },

  resultsSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "6px",
    marginBottom: 0,
  },

  resultBadge: {
    background: "#1d4ed8",
    padding: "8px 13px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
  },

  headRow: {
    background: "#334155",
  },

  row: {
    borderBottom:
      "1px solid #334155",
  },

  categoryBadge: {
    background: "#1e3a8a",
    color: "#bfdbfe",
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "12px",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  secondaryButton: {
    marginTop: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  quickCard: {
    marginTop: "25px",
    background: "#1e293b",
    border:
      "1px solid #334155",
    borderRadius: "18px",
    padding: "25px",
  },

  quickTitle: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "20px",
  },

  quickButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  quickButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "11px 16px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

};

const th = {
  padding: "16px 14px",
  textAlign: "left",
  color: "#f8fafc",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

const td = {
  padding: "16px 14px",
  color: "#e2e8f0",
  fontSize: "14px",
  whiteSpace: "nowrap",
};


export default SearchChemical;