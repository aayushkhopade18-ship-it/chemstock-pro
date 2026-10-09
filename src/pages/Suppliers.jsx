import React, { useContext, useMemo, useState } from "react";
import {
  FaTruck,
  FaSearch,
  FaBuilding,
  FaFlask,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { ChemicalContext } from "../context/ChemicalContext";

function Suppliers() {
  const navigate = useNavigate();

  const { chemicals = [], loading } =
    useContext(ChemicalContext);

  const [search, setSearch] = useState("");

  /* =========================
     SUPPLIER DATA
  ========================= */

  const suppliers = useMemo(() => {
    const supplierMap = {};

    chemicals.forEach((chemical) => {
      const supplierName =
        String(chemical.supplier || "").trim() ||
        "Not Specified";

      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = {
          name: supplierName,

          contactPerson: "",

          phone: "",

          email: "",

          address: "",

          chemicals: [],

          categories: new Set(),
        };
      }

      const supplier = supplierMap[supplierName];

      /* ADD CHEMICAL */

      supplier.chemicals.push(chemical);

      /* ADD CATEGORY */

      if (chemical.category) {
        supplier.categories.add(
          chemical.category
        );
      }

      /* =========================
         CONTACT PERSON
      ========================= */

      if (!supplier.contactPerson) {
        supplier.contactPerson =
          chemical.contactPerson ||
          chemical.supplierContact ||
          chemical.contact ||
          chemical.contactName ||
          "";
      }

      /* =========================
         PHONE
      ========================= */

      if (!supplier.phone) {
        supplier.phone =
          chemical.supplierPhone ||
          chemical.phone ||
          chemical.contactPhone ||
          chemical.mobile ||
          chemical.mobileNumber ||
          "";
      }

      /* =========================
         EMAIL
      ========================= */

      if (!supplier.email) {
        supplier.email =
          chemical.supplierEmail ||
          chemical.email ||
          chemical.contactEmail ||
          "";
      }

      /* =========================
         ADDRESS
      ========================= */

      if (!supplier.address) {
        supplier.address =
          chemical.supplierAddress ||
          chemical.address ||
          chemical.location ||
          chemical.supplierLocation ||
          "";
      }
    });

    return Object.values(supplierMap)
      .map((supplier) => ({
        ...supplier,

        contactPerson:
          supplier.contactPerson || "-",

        phone:
          supplier.phone || "-",

        email:
          supplier.email || "-",

        address:
          supplier.address || "-",

        totalChemicals:
          supplier.chemicals.length,

        totalCategories:
          supplier.categories.size,

        categories: Array.from(
          supplier.categories
        ),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [chemicals]);

  /* =========================
     SEARCH
  ========================= */

  const filteredSuppliers =
    suppliers.filter((supplier) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) return true;

      return (
        String(supplier.name)
          .toLowerCase()
          .includes(searchText) ||

        String(supplier.contactPerson)
          .toLowerCase()
          .includes(searchText) ||

        String(supplier.phone)
          .toLowerCase()
          .includes(searchText) ||

        String(supplier.email)
          .toLowerCase()
          .includes(searchText) ||

        String(supplier.address)
          .toLowerCase()
          .includes(searchText)
      );
    });

  /* =========================
     STATS
  ========================= */

  const specifiedSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier.name !== "Not Specified"
    );

  const totalSupplierChemicals =
    specifiedSuppliers.reduce(
      (total, supplier) =>
        total + supplier.totalChemicals,
      0
    );

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
          Loading supplier information...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>

        <div>

          <div style={styles.pageLabel}>
            LABORATORY MANAGEMENT
          </div>

          <h1 style={styles.title}>
            Suppliers
          </h1>

          <p style={styles.subtitle}>
            Manage supplier contacts and chemical supply information
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/inventory")
          }
          style={styles.backButton}
        >
          <FaArrowLeft />
          Back to Inventory
        </button>

      </div>


      {/* ================= STATS ================= */}

      <div style={styles.statsGrid}>

        <div style={styles.statCard}>

          <div style={styles.statIcon}>
            <FaTruck />
          </div>

          <div>

            <div style={styles.statLabel}>
              Total Suppliers
            </div>

            <div style={styles.statValue}>
              {specifiedSuppliers.length}
            </div>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(34,197,94,0.12)",
              color: "#4ade80",
            }}
          >
            <FaFlask />
          </div>

          <div>

            <div style={styles.statLabel}>
              Chemicals Supplied
            </div>

            <div style={styles.statValue}>
              {totalSupplierChemicals}
            </div>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(167,139,250,0.12)",
              color: "#a78bfa",
            }}
          >
            <FaBoxOpen />
          </div>

          <div>

            <div style={styles.statLabel}>
              Total Inventory
            </div>

            <div style={styles.statValue}>
              {chemicals.length}
            </div>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background:
                "rgba(251,191,36,0.12)",
              color: "#fbbf24",
            }}
          >
            <FaBuilding />
          </div>

          <div>

            <div style={styles.statLabel}>
              Supplier Records
            </div>

            <div style={styles.statValue}>
              {suppliers.length}
            </div>

          </div>

        </div>

      </div>


      {/* ================= MAIN PANEL ================= */}

      <div style={styles.panel}>

        {/* PANEL HEADER */}

        <div style={styles.panelHeader}>

          <div>

            <h2 style={styles.panelTitle}>
              Supplier Directory
            </h2>

            <p style={styles.panelSubtitle}>
              {filteredSuppliers.length} supplier records found
            </p>

          </div>


          <div style={styles.searchBox}>

            <FaSearch style={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search supplier, phone or email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.searchInput}
            />

          </div>

        </div>


        {/* ================= TABLE ================= */}

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  Supplier
                </th>

                <th style={styles.th}>
                  Contact Person
                </th>

                <th style={styles.th}>
                  Phone Number
                </th>

                <th style={styles.th}>
                  Email Address
                </th>

                <th style={styles.th}>
                  Address
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "center",
                  }}
                >
                  Chemicals
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "center",
                  }}
                >
                  Categories
                </th>

                <th style={styles.th}>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredSuppliers.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    style={styles.emptyCell}
                  >

                    <div style={styles.emptyIcon}>
                      <FaTruck />
                    </div>

                    <h3 style={styles.emptyTitle}>
                      No suppliers found
                    </h3>

                    <p style={styles.emptyText}>
                      Add supplier information while adding chemicals.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredSuppliers.map(
                  (supplier, index) => {

                    const isSpecified =
                      supplier.name !==
                      "Not Specified";

                    const hasCompleteDetails =
                      supplier.contactPerson !== "-" &&
                      supplier.phone !== "-" &&
                      supplier.email !== "-" &&
                      supplier.address !== "-";

                    return (

                      <tr
                        key={`${supplier.name}-${index}`}
                        style={styles.row}
                      >

                        {/* SUPPLIER */}

                        <td style={styles.td}>

                          <div style={styles.supplierBox}>

                            <div style={styles.supplierIcon}>
                              <FaBuilding />
                            </div>

                            <strong style={styles.supplierName}>
                              {supplier.name}
                            </strong>

                          </div>

                        </td>


                        {/* CONTACT PERSON */}

                        <td style={styles.td}>

                          <div style={styles.contactBox}>

                            <FaUser
                              style={styles.contactIcon}
                            />

                            <span style={styles.valueText}>
                              {supplier.contactPerson}
                            </span>

                          </div>

                        </td>


                        {/* PHONE */}

                        <td style={styles.td}>

                          <div style={styles.contactBox}>

                            <FaPhoneAlt
                              style={styles.contactIcon}
                            />

                            <span style={styles.valueText}>
                              {supplier.phone}
                            </span>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td style={styles.td}>

                          <div style={styles.contactBox}>

                            <FaEnvelope
                              style={styles.contactIcon}
                            />

                            <span style={styles.emailText}>
                              {supplier.email}
                            </span>

                          </div>

                        </td>


                        {/* ADDRESS */}

                        <td style={styles.td}>

                          <div style={styles.addressBox}>

                            <FaMapMarkerAlt
                              style={styles.contactIcon}
                            />

                            <span style={styles.addressText}>
                              {supplier.address}
                            </span>

                          </div>

                        </td>


                        {/* CHEMICAL COUNT */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span style={styles.countBadge}>
                            {supplier.totalChemicals}
                          </span>

                        </td>


                        {/* CATEGORY COUNT */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span style={styles.categoryCount}>
                            {supplier.totalCategories}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td style={styles.td}>

                          <span
                            style={{
                              ...styles.statusBadge,

                              ...(isSpecified &&
                              hasCompleteDetails
                                ? styles.activeStatus
                                : styles.missingStatus),
                            }}
                          >

                            {isSpecified &&
                            hasCompleteDetails ? (
                              <>
                                <FaCheckCircle />
                                Active
                              </>
                            ) : (
                              <>
                                <FaTimesCircle />
                                Incomplete
                              </>
                            )}

                          </span>

                        </td>

                      </tr>

                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        {filteredSuppliers.length > 0 && (

          <div style={styles.tableFooter}>

            Showing{" "}

            <strong>
              {filteredSuppliers.length}
            </strong>

            {" "}of{" "}

            <strong>
              {suppliers.length}
            </strong>

            {" "}supplier records

          </div>

        )}

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
    padding: "42px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #07111f 0%, #0b1b33 45%, #0d2445 100%)",
    color: "#f8fafc",
    fontFamily:
      "'Inter', 'Poppins', Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },

  pageLabel: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "750",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "13px 18px",
    borderRadius: "11px",
    border:
      "1px solid rgba(148,163,184,0.16)",
    background:
      "rgba(30,41,59,0.75)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontWeight: "600",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.9))",
    border:
      "1px solid rgba(148,163,184,0.13)",
    borderRadius: "18px",
    padding: "21px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "5px",
  },

  statValue: {
    fontSize: "26px",
    fontWeight: "750",
    color: "#f8fafc",
  },

  panel: {
    background:
      "rgba(15,23,42,0.72)",
    backdropFilter: "blur(18px)",
    border:
      "1px solid rgba(148,163,184,0.12)",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.2)",
  },

  panelHeader: {
    padding: "25px",
    borderBottom:
      "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background:
      "rgba(30,41,59,0.8)",
    border:
      "1px solid rgba(148,163,184,0.15)",
    borderRadius: "11px",
    padding: "0 14px",
    height: "44px",
  },

  searchIcon: {
    color: "#64748b",
    fontSize: "14px",
    flexShrink: 0,
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#f8fafc",
    width: "260px",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "visible",
  },

  table: {
    width: "100%",
    minWidth: "1500px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "16px 20px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    background:
      "rgba(2,6,23,0.3)",
    whiteSpace: "nowrap",
  },

  row: {
    borderTop:
      "1px solid rgba(148,163,184,0.08)",
  },

  td: {
    padding: "18px 20px",
    fontSize: "13px",
    color: "#cbd5e1",
    verticalAlign: "middle",
  },

  supplierBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "180px",
  },

  supplierIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  supplierName: {
    color: "#f1f5f9",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  contactBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#cbd5e1",
    minWidth: "160px",
    whiteSpace: "nowrap",
  },

  contactIcon: {
    color: "#38bdf8",
    fontSize: "13px",
    flexShrink: 0,
  },

  valueText: {
    color: "#cbd5e1",
    fontSize: "13px",
  },

  emailText: {
    color: "#93c5fd",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  addressBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    minWidth: "250px",
    maxWidth: "350px",
    color: "#cbd5e1",
  },

  addressText: {
    color: "#cbd5e1",
    lineHeight: "1.5",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },

  countBadge: {
    display: "inline-flex",
    minWidth: "30px",
    height: "30px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    fontWeight: "700",
  },

  categoryCount: {
    display: "inline-flex",
    minWidth: "30px",
    height: "30px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background:
      "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    fontWeight: "700",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  activeStatus: {
    color: "#4ade80",
    background:
      "rgba(34,197,94,0.1)",
  },

  missingStatus: {
    color: "#fbbf24",
    background:
      "rgba(251,191,36,0.1)",
  },

  tableFooter: {
    padding: "17px 22px",
    borderTop:
      "1px solid rgba(148,163,184,0.1)",
    color: "#64748b",
    fontSize: "12px",
  },

  emptyCell: {
    textAlign: "center",
    padding: "80px 20px",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    margin: "0 auto 18px",
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: 0,
    color: "#f1f5f9",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "13px",
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#07111f,#0d2445)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  loader: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border:
      "4px solid rgba(255,255,255,0.12)",
    borderTop:
      "4px solid #38bdf8",
    animation:
      "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "15px",
    color: "#94a3b8",
  },

};

export default Suppliers;