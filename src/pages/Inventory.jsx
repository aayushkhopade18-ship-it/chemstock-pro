import React, {
  useContext,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
  FaPrint,
  FaShieldAlt,
  FaTimes,
  FaExternalLinkAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { ChemicalContext } from "../context/ChemicalContext";
import { useAuth } from "../context/AuthContext";

const Inventory = () => {
  const navigate = useNavigate();

  const {
    chemicals = [],
    loading,
    updateChemical,
    deleteChemical,
  } = useContext(ChemicalContext);

  const { hasFullAccess } = useAuth();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [safetyChemical, setSafetyChemical] = useState(null);
  const [editingChemical, setEditingChemical] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    formula: "",
    casNumber: "",
    category: "",
    quantity: "",
    unit: "",
    supplier: "",
    boughtDate: "",
    expiry: "",
    location: "",
  });

  /* =====================================================
     HELPER: EXTRACT BOUGHT DATE (WITH SMART FALLBACK)
  ===================================================== */
  const getBoughtDate = (chemical) => {
    if (chemical.boughtDate) return chemical.boughtDate;
    if (chemical.purchaseDate) return chemical.purchaseDate;
    if (chemical.date) return chemical.date;
    if (chemical.createdAt?.toDate) {
      return chemical.createdAt.toDate().toISOString().split("T")[0];
    }
    if (typeof chemical.createdAt === "string" && chemical.createdAt.includes("-")) {
      return chemical.createdAt.split("T")[0];
    }
    return "Earlier Stock";
  };

  /* =====================================================
     CATEGORIES
  ===================================================== */
  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        chemicals
          .map((chemical) => chemical.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...unique];
  }, [chemicals]);

  /* =====================================================
     FILTER
  ===================================================== */
  const filteredChemicals = useMemo(() => {
    return chemicals.filter((chemical) => {
      const text = search.toLowerCase().trim();

      const matchesSearch =
        !text ||
        chemical.name?.toLowerCase().includes(text) ||
        chemical.formula?.toLowerCase().includes(text) ||
        chemical.category?.toLowerCase().includes(text) ||
        chemical.supplier?.toLowerCase().includes(text) ||
        chemical.location?.toLowerCase().includes(text);

      const matchesCategory =
        category === "All" || chemical.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [chemicals, search, category]);

  /* =====================================================
     EDIT
  ===================================================== */
  const openEditModal = (chemical) => {
    if (!hasFullAccess) return;

    setEditingChemical(chemical);

    setEditData({
      name: chemical.name || "",
      formula: chemical.formula || "",
      casNumber: chemical.casNumber || "",
      category: chemical.category || "",
      quantity: chemical.quantity ?? "",
      unit: chemical.unit || "",
      supplier: chemical.supplier || "",
      boughtDate: chemical.boughtDate || chemical.purchaseDate || "",
      expiry: chemical.expiry || chemical.expiryDate || "",
      location: chemical.location || "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingChemical || !hasFullAccess) {
      return;
    }

    try {
      await updateChemical({
        ...editingChemical,
        ...editData,
        id: editingChemical.id,
        quantity: Number(editData.quantity),
        boughtDate: editData.boughtDate || "",
        purchaseDate: editData.boughtDate || "",
        safetyData: editingChemical.safetyData || null,
      });

      setEditingChemical(null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update chemical.");
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */
  const handleDelete = async () => {
    if (!deleting || !hasFullAccess) {
      return;
    }

    try {
      await deleteChemical(deleting.id);
      setDeleting(null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete chemical.");
    }
  };

  /* =====================================================
     SAFETY
  ===================================================== */
  const openSafety = (chemical) => {
    setSafetyChemical(chemical);
  };

  const closeSafety = () => {
    setSafetyChemical(null);
  };

  const getHazardLevel = (safetyData) => {
    if (!safetyData) return "CHECK SDS";
    if (typeof safetyData.hazardLevel === "string") return safetyData.hazardLevel;
    if (safetyData.hazardLevel && typeof safetyData.hazardLevel === "object") {
      return safetyData.hazardLevel.level || "CHECK SDS";
    }
    return "CHECK SDS";
  };

  const getHazardIcon = (level) => {
    switch (level) {
      case "HIGH":
        return "🔴";
      case "MEDIUM-HIGH":
        return "🟠";
      case "MEDIUM":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getHazardStyle = (level) => {
    switch (level) {
      case "HIGH":
        return styles.high;
      case "MEDIUM-HIGH":
        return styles.mediumHigh;
      case "MEDIUM":
        return styles.medium;
      default:
        return styles.checkSds;
    }
  };

  const SafetySection = ({ title, items }) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    return (
      <div style={styles.safetySection}>
        <h4 style={styles.safetySectionTitle}>{title}</h4>
        <ul style={styles.safetyList}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  /* =====================================================
     PDF EXPORT (INCLUDES BOUGHT DATE)
  ===================================================== */
  const exportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("ChemStock Pro - Chemical Inventory", 14, 18);

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    const rows = filteredChemicals.map((chemical) => [
      chemical.name || "",
      chemical.formula || "",
      chemical.category || "",
      `${chemical.quantity ?? ""} ${chemical.unit || ""}`,
      chemical.supplier || "",
      getBoughtDate(chemical),
      chemical.expiry || chemical.expiryDate || "",
      chemical.location || "",
    ]);

    autoTable(pdf, {
      startY: 32,
      head: [[
        "Chemical",
        "Formula",
        "Category",
        "Quantity",
        "Supplier",
        "Bought Date",
        "Expiry",
        "Location",
      ]],
      body: rows,
      styles: {
        fontSize: 8,
      },
    });

    pdf.save("chemical-inventory.pdf");
  };

  /* =====================================================
     EXCEL EXPORT (INCLUDES BOUGHT DATE)
  ===================================================== */
  const exportExcel = () => {
    const data = filteredChemicals.map((chemical) => ({
      Chemical: chemical.name || "",
      Formula: chemical.formula || "",
      "CAS Number": chemical.casNumber || "",
      Category: chemical.category || "",
      Quantity: chemical.quantity ?? "",
      Unit: chemical.unit || "",
      Supplier: chemical.supplier || "",
      "Bought Date": getBoughtDate(chemical),
      "Expiry Date": chemical.expiry || chemical.expiryDate || "",
      Location: chemical.location || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "chemical-inventory.xlsx");
  };

  const printInventory = () => {
    window.print();
  };

  /* =====================================================
     LOADING
  ===================================================== */
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading chemical inventory...</p>
      </div>
    );
  }

  /* =====================================================
     PAGE RENDER
  ===================================================== */
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>LABORATORY INVENTORY</div>
          <h1 style={styles.title}>Chemical Inventory</h1>
          <p style={styles.subtitle}>
            Manage and monitor your laboratory chemicals
          </p>
        </div>

        {hasFullAccess && (
          <button
            style={styles.addButton}
            onClick={() => navigate("/add-chemical")}
          >
            <FaPlus />
            Add Chemical
          </button>
        )}
      </div>

      {/* STUDENT VIEW-ONLY NOTICE */}
      {!hasFullAccess && (
        <div style={styles.viewOnlyNotice}>
          <strong>VIEW ONLY</strong>
          <span>You can view inventory and safety information.</span>
        </div>
      )}

      {/* CONTROLS */}
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search chemical, formula, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>

        <button style={styles.exportButton} onClick={exportPDF}>
          <FaFilePdf />
          PDF
        </button>

        <button style={styles.exportButton} onClick={exportExcel}>
          <FaFileExcel />
          Excel
        </button>

        <button style={styles.exportButton} onClick={printInventory}>
          <FaPrint />
          Print
        </button>
      </div>

      {/* RESULT COUNTER */}
      <div style={styles.resultInfo}>
        Showing <strong>{filteredChemicals.length}</strong> of{" "}
        <strong>{chemicals.length}</strong> chemicals
      </div>

      {/* TABLE WITH DEDICATED BOUGHT DATE COLUMN */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Chemical</th>
              <th style={styles.th}>Formula</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Supplier</th>
              <th style={{ ...styles.th, color: "#7dd3fc" }}>Bought Date</th>
              <th style={styles.th}>Expiry</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Safety</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredChemicals.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.empty}>
                  <div style={styles.emptyIcon}>🧪</div>
                  <h3>No chemicals found</h3>
                  <p>
                    {chemicals.length === 0
                      ? "Your chemical inventory is empty."
                      : "Try changing your search or filter."}
                  </p>

                  {chemicals.length === 0 && hasFullAccess && (
                    <button
                      style={styles.addButton}
                      onClick={() => navigate("/add-chemical")}
                    >
                      <FaPlus />
                      Add First Chemical
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredChemicals.map((chemical) => (
                <tr key={chemical.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong style={styles.chemicalName}>
                      {chemical.name || "Unnamed"}
                    </strong>
                  </td>

                  <td style={styles.td}>{chemical.formula || "-"}</td>

                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {chemical.category || "Other"}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <strong>{chemical.quantity ?? 0}</strong> {chemical.unit || ""}
                  </td>

                  <td style={styles.td}>{chemical.supplier || "-"}</td>

                  {/* BOUGHT DATE */}
                  <td style={styles.td}>
                    <span style={styles.dateBadge}>
                      <FaCalendarAlt style={{ marginRight: "5px", fontSize: "10px" }} />
                      {getBoughtDate(chemical)}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {chemical.expiry || chemical.expiryDate || "-"}
                  </td>

                  <td style={styles.td}>{chemical.location || "-"}</td>

                  {/* SAFETY BUTTON */}
                  <td style={styles.td}>
                    <button
                      style={styles.safetyButton}
                      onClick={() => openSafety(chemical)}
                    >
                      <FaShieldAlt />
                      Safety
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td style={styles.td}>
                    {hasFullAccess ? (
                      <div style={styles.actions}>
                        <button
                          style={styles.editButton}
                          onClick={() => openEditModal(chemical)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          style={styles.deleteButton}
                          onClick={() => setDeleting(chemical)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <span style={styles.viewOnly}>View Only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          SAFETY MODAL
      ================================================= */}
      {safetyChemical && (
        <div style={styles.modalOverlay} onClick={closeSafety}>
          <div
            style={styles.safetyModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.safetyHeader}>
              <div>
                <div style={styles.safetyHeading}>
                  <FaShieldAlt />
                  <span>Safety Information</span>
                </div>

                <div style={styles.safetyChemicalName}>
                  {safetyChemical.name}
                  {safetyChemical.formula ? ` • ${safetyChemical.formula}` : ""}
                </div>

                {safetyChemical.casNumber && (
                  <div style={styles.casNumber}>
                    CAS: {safetyChemical.casNumber}
                  </div>
                )}
              </div>

              <button style={styles.closeButton} onClick={closeSafety}>
                <FaTimes />
              </button>
            </div>

            {!safetyChemical.safetyData ? (
              <div style={styles.noSafety}>
                <FaShieldAlt />
                <h3>Safety data not available</h3>
                <p>
                  This record was created before automatic safety data was saved,
                  or the safety lookup did not return usable information.
                </p>
                <p style={styles.noSafetySmall}>
                  Add the chemical again to generate and save its automatic safety summary.
                </p>
              </div>
            ) : (
              <div style={styles.safetyContent}>
                {(() => {
                  const level = getHazardLevel(safetyChemical.safetyData);

                  return (
                    <div
                      style={{
                        ...styles.hazardBox,
                        ...getHazardStyle(level),
                      }}
                    >
                      <div style={styles.hazardMain}>
                        <span style={styles.hazardEmoji}>
                          {getHazardIcon(level)}
                        </span>
                        <div>
                          <strong>Hazard Level</strong>
                          <div style={styles.hazardLevelText}>{level}</div>
                        </div>
                      </div>

                      {safetyChemical.safetyData.signalWord && (
                        <span>
                          Signal Word: {safetyChemical.safetyData.signalWord}
                        </span>
                      )}
                    </div>
                  );
                })()}

                <SafetySection
                  title="⚠️ Main Hazards"
                  items={safetyChemical.safetyData.hazards}
                />
                <SafetySection
                  title="🧤 How to Handle"
                  items={safetyChemical.safetyData.handling}
                />
                <SafetySection
                  title="📦 Storage"
                  items={safetyChemical.safetyData.storage}
                />
                <SafetySection
                  title="🚫 Keep Away From"
                  items={safetyChemical.safetyData.keepAway}
                />
                <SafetySection
                  title="🥽 PPE"
                  items={safetyChemical.safetyData.ppe}
                />
                <SafetySection
                  title="🚑 First Aid"
                  items={safetyChemical.safetyData.firstAid}
                />
                <SafetySection
                  title="🚨 Spill Response"
                  items={safetyChemical.safetyData.spill}
                />
                <SafetySection
                  title="🔥 Fire Response"
                  items={safetyChemical.safetyData.fire}
                />
                <SafetySection
                  title="☠️ Toxicity"
                  items={safetyChemical.safetyData.toxicity}
                />
                <SafetySection
                  title="🔬 Stability / Reactivity"
                  items={safetyChemical.safetyData.stability}
                />
                <SafetySection
                  title="⚠️ Precautions"
                  items={safetyChemical.safetyData.precautions}
                />

                {(safetyChemical.safetyData.sourceUrl ||
                  safetyChemical.safetyData.pubchemUrl) && (
                  <div style={styles.sourceBox}>
                    <span>Safety source</span>
                    <a
                      href={
                        safetyChemical.safetyData.sourceUrl ||
                        safetyChemical.safetyData.pubchemUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.sourceLink}
                    >
                      PubChem
                      <FaExternalLinkAlt />
                    </a>
                  </div>
                )}

                <div style={styles.warning}>
                  <strong>Important:</strong> This is an automatic safety summary
                  and does not replace the current manufacturer SDS. Verify the SDS
                  for the actual concentration/product before laboratory use.
                </div>
              </div>
            )}

            <div style={styles.safetyFooter}>
              <button style={styles.closeModalButton} onClick={closeSafety}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          EDIT MODAL (WITH BOUGHT DATE FIELD)
      ================================================= */}
      {editingChemical && hasFullAccess && (
        <div
          style={styles.modalOverlay}
          onClick={() => setEditingChemical(null)}
        >
          <div
            style={styles.editModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Edit Chemical</h2>
                <p style={styles.modalSubtitle}>Update inventory details</p>
              </div>

              <button
                style={styles.editCloseButton}
                onClick={() => setEditingChemical(null)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Chemical Name</label>
                  <input
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Formula</label>
                  <input
                    name="formula"
                    value={editData.formula}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>CAS Number</label>
                  <input
                    name="casNumber"
                    value={editData.casNumber}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <input
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={editData.quantity}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Unit</label>
                  <input
                    name="unit"
                    value={editData.unit}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Supplier</label>
                  <input
                    name="supplier"
                    value={editData.supplier}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                {/* BOUGHT DATE IN EDIT MODAL */}
                <div style={styles.field}>
                  <label style={styles.label}>Bought Date</label>
                  <input
                    name="boughtDate"
                    type="date"
                    value={editData.boughtDate}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Expiry Date</label>
                  <input
                    name="expiry"
                    type="date"
                    value={editData.expiry}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Location</label>
                  <input
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setEditingChemical(null)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.saveButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}
      {deleting && hasFullAccess && (
        <div style={styles.modalOverlay} onClick={() => setDeleting(null)}>
          <div
            style={styles.deleteModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.deleteIcon}>
              <FaTrash />
            </div>

            <h2 style={styles.deleteTitle}>Delete Chemical?</h2>

            <p style={styles.deleteText}>
              Are you sure you want to delete <strong>{deleting.name}</strong>?
            </p>

            <p style={styles.deleteSmall}>This action cannot be undone.</p>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setDeleting(null)}
              >
                Cancel
              </button>

              <button style={styles.confirmDelete} onClick={handleDelete}>
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   STYLES
============================================================ */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #061b45 0%, #082b68 45%, #064fc4 100%)",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #061b45 0%, #082b68 45%, #064fc4 100%)",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid rgba(255,255,255,0.25)",
    borderTop: "4px solid #ffffff",
    borderRadius: "50%",
    marginBottom: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#7dd3fc",
    marginBottom: "7px",
  },
  title: {
    margin: 0,
    fontSize: "31px",
    fontWeight: 800,
    color: "#ffffff",
  },
  subtitle: {
    margin: "7px 0 0",
    color: "#b9d5ff",
    fontSize: "14px",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 17px",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "9px",
    background: "linear-gradient(135deg, #1688ff, #1262dc)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
  },
  viewOnlyNotice: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    marginBottom: "18px",
    borderRadius: "9px",
    background: "rgba(37,99,235,0.28)",
    border: "1px solid rgba(147,197,253,0.3)",
    color: "#dbeafe",
    fontSize: "13px",
  },
  controls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "13px",
  },
  searchBox: {
    position: "relative",
    flex: "1 1 300px",
    minWidth: "230px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#8fb7e8",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px 12px 40px",
    borderRadius: "9px",
    border: "1px solid rgba(147,197,253,0.28)",
    outline: "none",
    background: "rgba(255,255,255,0.10)",
    color: "#ffffff",
    fontSize: "13px",
  },
  select: {
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1px solid rgba(147,197,253,0.28)",
    background: "#0b3475",
    color: "#ffffff",
    minWidth: "155px",
    outline: "none",
  },
  exportButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 13px",
    borderRadius: "8px",
    border: "1px solid rgba(147,197,253,0.28)",
    background: "rgba(255,255,255,0.10)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  resultInfo: {
    color: "#a9c8f4",
    fontSize: "13px",
    marginBottom: "12px",
  },
  tableCard: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid rgba(147,197,253,0.25)",
    background:
      "linear-gradient(145deg, rgba(10,54,119,0.92), rgba(7,39,91,0.96))",
    boxShadow: "0 12px 35px rgba(0,0,0,0.20)",
  },
  table: {
    width: "100%",
    minWidth: "1160px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    background: "rgba(2,20,54,0.55)",
    borderBottom: "1px solid rgba(147,197,253,0.20)",
    color: "#dbeafe",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  tableRow: {
    background: "transparent",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid rgba(147,197,253,0.12)",
    color: "#d4e5ff",
    fontSize: "13px",
    verticalAlign: "middle",
  },
  chemicalName: {
    color: "#ffffff",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "rgba(96,165,250,0.18)",
    border: "1px solid rgba(147,197,253,0.20)",
    color: "#bfdbfe",
    fontSize: "11px",
    fontWeight: 700,
  },
  dateBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(125,211,252,0.12)",
    border: "1px solid rgba(125,211,252,0.25)",
    color: "#7dd3fc",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  safetyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "7px",
    border: "1px solid rgba(165,180,252,0.35)",
    background: "rgba(99,102,241,0.18)",
    color: "#c7d2fe",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: "7px",
  },
  editButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(147,197,253,0.2)",
    borderRadius: "6px",
    background: "rgba(37,99,235,0.25)",
    color: "#93c5fd",
    cursor: "pointer",
  },
  deleteButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(252,165,165,0.2)",
    borderRadius: "6px",
    background: "rgba(220,38,38,0.18)",
    color: "#fca5a5",
    cursor: "pointer",
  },
  viewOnly: {
    color: "#93b4df",
    fontSize: "12px",
    fontWeight: 600,
  },
  empty: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#a9c8f4",
  },
  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(0,10,30,0.72)",
    backdropFilter: "blur(5px)",
  },
  safetyModal: {
    width: "100%",
    maxWidth: "720px",
    maxHeight: "88vh",
    overflowY: "auto",
    borderRadius: "13px",
    background: "linear-gradient(145deg, #0b3475, #061d4d)",
    border: "1px solid rgba(147,197,253,0.28)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
  },
  editModal: {
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "13px",
    background: "#ffffff",
    color: "#111827",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
  },
  safetyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 22px",
    borderBottom: "1px solid rgba(147,197,253,0.18)",
  },
  safetyHeading: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#bfdbfe",
    fontSize: "20px",
    fontWeight: 800,
  },
  safetyChemicalName: {
    marginTop: "6px",
    color: "#8fb7e8",
    fontSize: "13px",
  },
  casNumber: {
    marginTop: "4px",
    color: "#6f9bd2",
    fontSize: "11px",
  },
  closeButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "7px",
    background: "rgba(255,255,255,0.10)",
    color: "#dbeafe",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  safetyContent: {
    padding: "18px 22px",
  },
  hazardBox: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "14px",
    fontSize: "13px",
  },
  hazardMain: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  hazardEmoji: {
    fontSize: "24px",
  },
  hazardLevelText: {
    marginTop: "2px",
    fontWeight: 800,
  },
  high: {
    background: "rgba(220,38,38,0.20)",
    border: "1px solid rgba(252,165,165,0.35)",
    color: "#fecaca",
  },
  mediumHigh: {
    background: "rgba(234,88,12,0.20)",
    border: "1px solid rgba(253,186,116,0.35)",
    color: "#fed7aa",
  },
  medium: {
    background: "rgba(202,138,4,0.20)",
    border: "1px solid rgba(253,224,71,0.30)",
    color: "#fef08a",
  },
  checkSds: {
    background: "rgba(100,116,139,0.20)",
    border: "1px solid rgba(148,163,184,0.30)",
    color: "#cbd5e1",
  },
  safetySection: {
    marginBottom: "14px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(147,197,253,0.13)",
  },
  safetySectionTitle: {
    margin: "0 0 7px",
    fontSize: "14px",
    color: "#ffffff",
  },
  safetyList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#c7dbf7",
    fontSize: "13px",
    lineHeight: 1.55,
  },
  sourceBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "7px",
    background: "rgba(255,255,255,0.07)",
    color: "#c7dbf7",
    fontSize: "13px",
  },
  sourceLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#7dd3fc",
    textDecoration: "none",
    fontWeight: 700,
  },
  warning: {
    marginTop: "14px",
    padding: "11px 13px",
    borderRadius: "7px",
    background: "rgba(234,88,12,0.15)",
    border: "1px solid rgba(253,186,116,0.25)",
    color: "#fed7aa",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  noSafety: {
    padding: "50px 25px",
    textAlign: "center",
    color: "#a9c8f4",
  },
  noSafetySmall: {
    maxWidth: "470px",
    margin: "12px auto 0",
    color: "#7fa5d8",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  safetyFooter: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "13px 22px",
    borderTop: "1px solid rgba(147,197,253,0.18)",
  },
  closeModalButton: {
    padding: "9px 17px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 22px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },
  modalSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },
  editCloseButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "7px",
    background: "#f3f4f6",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    padding: "20px 22px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    padding: "10px 11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    color: "#111827",
    background: "#ffffff",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "15px 22px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelButton: {
    padding: "9px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 600,
  },
  saveButton: {
    padding: "9px 16px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteModal: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    textAlign: "center",
  },
  deleteIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "20px",
  },
  deleteTitle: {
    margin: "0 0 10px",
    color: "#111827",
  },
  deleteText: {
    color: "#4b5563",
    fontSize: "14px",
  },
  deleteSmall: {
    color: "#9ca3af",
    fontSize: "12px",
  },
  confirmDelete: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 16px",
    border: "none",
    borderRadius: "7px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Inventory;