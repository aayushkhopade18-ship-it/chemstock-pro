import React, { useEffect, useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("laboratory");
  const [savedMessage, setSavedMessage] = useState("");

  const [settings, setSettings] = useState({
    laboratoryName: "",
    department: "",
    college: "",
    labIncharge: "",
    contactNumber: "",
    emailAddress: "",
    labAddress: "",

    lowStockThreshold: 10,
    expiryWarningDays: 30,
    defaultUnit: "g",
    requireLocation: true,
    requireSupplier: false,
    allowNegativeStock: false,

    lowStockAlerts: true,
    expiryAlerts: true,
    expiredAlerts: true,
    dailySummary: false,

    requireStudentName: true,
    requireRollNumber: true,
    requirePurpose: false,
    autoUpdateStock: true,

    darkMode: true,
    compactMode: false
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("chemstockSettings");

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(
      "chemstockSettings",
      JSON.stringify(settings)
    );

    setSavedMessage("Settings saved successfully ✓");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const clearSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings?"
      )
    ) {
      localStorage.removeItem("chemstockSettings");

      window.location.reload();
    }
  };

  const exportSettings = () => {
    const data = JSON.stringify(settings, null, 2);

    const blob = new Blob([data], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "chemstock-settings.json";

    link.click();

    URL.revokeObjectURL(url);
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        ...styles.toggle,
        background: value
          ? "#22c55e"
          : "#334155"
      }}
    >
      <div
        style={{
          ...styles.toggleCircle,
          transform: value
            ? "translateX(22px)"
            : "translateX(0)"
        }}
      />
    </button>
  );

  const tabs = [
    {
      id: "laboratory",
      icon: "🏢",
      label: "Laboratory"
    },
    {
      id: "inventory",
      icon: "📦",
      label: "Inventory Rules"
    },
    {
      id: "alerts",
      icon: "🔔",
      label: "Alerts"
    },
    {
      id: "issues",
      icon: "📋",
      label: "Issue Settings"
    },
    {
      id: "appearance",
      icon: "🎨",
      label: "Appearance"
    },
    {
      id: "data",
      icon: "💾",
      label: "Data & System"
    }
  ];

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <div style={styles.headingRow}>
            <div style={styles.headerIcon}>
              ⚙️
            </div>

            <div>
              <h1 style={styles.title}>
                Laboratory Settings
              </h1>

              <p style={styles.subtitle}>
                Configure your laboratory preferences,
                inventory rules and system settings
              </p>
            </div>
          </div>
        </div>

        <div style={styles.liveBadge}>
          <span style={styles.liveDot} />
          Settings Active
        </div>

      </div>


      {/* MAIN LAYOUT */}

      <div style={styles.layout}>


        {/* SIDEBAR */}

        <div style={styles.sidebar}>

          <div style={styles.sidebarTitle}>
            SETTINGS MENU
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id
                  ? styles.activeTab
                  : {})
              }}
            >
              <span style={styles.tabIcon}>
                {tab.icon}
              </span>

              {tab.label}

              {activeTab === tab.id && (
                <span style={styles.activeArrow}>
                  ›
                </span>
              )}
            </button>
          ))}


          <div style={styles.sidebarBottom}>

            <div style={styles.connectionCard}>

              <div style={styles.connectionIcon}>
                🧪
              </div>

              <div>
                <div style={styles.connectionTitle}>
                  ChemStock Pro
                </div>

                <div style={styles.connectionText}>
                  Laboratory Management System
                </div>
              </div>

            </div>

          </div>

        </div>


        {/* CONTENT */}

        <div style={styles.content}>


          {/* LABORATORY */}

          {activeTab === "laboratory" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    🏢 Laboratory Profile
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Basic information about your laboratory
                  </p>
                </div>

              </div>


              <div style={styles.card}>

                <div style={styles.formGrid}>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Laboratory Name
                    </label>

                    <input
                      value={settings.laboratoryName}
                      onChange={(e) =>
                        updateSetting(
                          "laboratoryName",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Chemistry Laboratory"
                      style={styles.input}
                    />
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Department
                    </label>

                    <input
                      value={settings.department}
                      onChange={(e) =>
                        updateSetting(
                          "department",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Pharmaceutical Chemistry"
                      style={styles.input}
                    />
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      College / Institution
                    </label>

                    <input
                      value={settings.college}
                      onChange={(e) =>
                        updateSetting(
                          "college",
                          e.target.value
                        )
                      }
                      placeholder="Enter college name"
                      style={styles.input}
                    />
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Lab Incharge
                    </label>

                    <input
                      value={settings.labIncharge}
                      onChange={(e) =>
                        updateSetting(
                          "labIncharge",
                          e.target.value
                        )
                      }
                      placeholder="Enter lab incharge name"
                      style={styles.input}
                    />
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Contact Number
                    </label>

                    <input
                      value={settings.contactNumber}
                      onChange={(e) =>
                        updateSetting(
                          "contactNumber",
                          e.target.value
                        )
                      }
                      placeholder="Enter contact number"
                      style={styles.input}
                    />
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={settings.emailAddress}
                      onChange={(e) =>
                        updateSetting(
                          "emailAddress",
                          e.target.value
                        )
                      }
                      placeholder="laboratory@example.com"
                      style={styles.input}
                    />
                  </div>

                </div>


                <div style={styles.field}>
                  <label style={styles.label}>
                    Laboratory Address
                  </label>

                  <textarea
                    value={settings.labAddress}
                    onChange={(e) =>
                      updateSetting(
                        "labAddress",
                        e.target.value
                      )
                    }
                    placeholder="Enter laboratory address"
                    style={styles.textarea}
                  />
                </div>


                <div style={styles.actionRow}>
                  <button
                    onClick={saveSettings}
                    style={styles.saveButton}
                  >
                    💾 Save Laboratory Profile
                  </button>
                </div>

              </div>

            </div>

          )}


          {/* INVENTORY */}

          {activeTab === "inventory" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    📦 Inventory Rules
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Control how chemical inventory is managed
                  </p>
                </div>

              </div>


              <div style={styles.card}>

                <div style={styles.formGrid}>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Default Low Stock Threshold
                    </label>

                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "lowStockThreshold",
                          Number(e.target.value)
                        )
                      }
                      style={styles.input}
                    />

                    <span style={styles.helperText}>
                      Chemicals at or below this quantity
                      can be flagged as low stock.
                    </span>
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Expiry Warning Period
                    </label>

                    <select
                      value={settings.expiryWarningDays}
                      onChange={(e) =>
                        updateSetting(
                          "expiryWarningDays",
                          Number(e.target.value)
                        )
                      }
                      style={styles.input}
                    >
                      <option value={7}>
                        7 Days
                      </option>

                      <option value={15}>
                        15 Days
                      </option>

                      <option value={30}>
                        30 Days
                      </option>

                      <option value={60}>
                        60 Days
                      </option>

                      <option value={90}>
                        90 Days
                      </option>
                    </select>
                  </div>


                  <div style={styles.field}>
                    <label style={styles.label}>
                      Default Quantity Unit
                    </label>

                    <select
                      value={settings.defaultUnit}
                      onChange={(e) =>
                        updateSetting(
                          "defaultUnit",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    >
                      <option value="g">
                        Grams (g)
                      </option>

                      <option value="kg">
                        Kilograms (kg)
                      </option>

                      <option value="ml">
                        Millilitres (ml)
                      </option>

                      <option value="L">
                        Litres (L)
                      </option>

                      <option value="pcs">
                        Pieces
                      </option>
                    </select>
                  </div>

                </div>


                <div style={styles.settingList}>

                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        📍 Require Storage Location
                      </div>

                      <div style={styles.settingDescription}>
                        Require a storage location when adding chemicals.
                      </div>
                    </div>

                    <Toggle
                      value={settings.requireLocation}
                      onChange={(value) =>
                        updateSetting(
                          "requireLocation",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        🏢 Require Supplier Information
                      </div>

                      <div style={styles.settingDescription}>
                        Ask for supplier details when adding chemicals.
                      </div>
                    </div>

                    <Toggle
                      value={settings.requireSupplier}
                      onChange={(value) =>
                        updateSetting(
                          "requireSupplier",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        ⚠️ Allow Negative Stock
                      </div>

                      <div style={styles.settingDescription}>
                        Allow inventory quantity to fall below zero.
                      </div>
                    </div>

                    <Toggle
                      value={settings.allowNegativeStock}
                      onChange={(value) =>
                        updateSetting(
                          "allowNegativeStock",
                          value
                        )
                      }
                    />

                  </div>

                </div>


                <div style={styles.actionRow}>
                  <button
                    onClick={saveSettings}
                    style={styles.saveButton}
                  >
                    💾 Save Inventory Rules
                  </button>
                </div>

              </div>

            </div>

          )}


          {/* ALERTS */}

          {activeTab === "alerts" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    🔔 Alert Preferences
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Choose which laboratory warnings you want to see
                  </p>
                </div>

              </div>


              <div style={styles.card}>

                <div style={styles.settingList}>

                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        📦 Low Stock Alerts
                      </div>

                      <div style={styles.settingDescription}>
                        Show warnings when chemicals reach minimum stock.
                      </div>
                    </div>

                    <Toggle
                      value={settings.lowStockAlerts}
                      onChange={(value) =>
                        updateSetting(
                          "lowStockAlerts",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        ⏰ Expiry Alerts
                      </div>

                      <div style={styles.settingDescription}>
                        Notify about chemicals approaching expiry.
                      </div>
                    </div>

                    <Toggle
                      value={settings.expiryAlerts}
                      onChange={(value) =>
                        updateSetting(
                          "expiryAlerts",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        🔴 Expired Chemical Alerts
                      </div>

                      <div style={styles.settingDescription}>
                        Highlight chemicals that have already expired.
                      </div>
                    </div>

                    <Toggle
                      value={settings.expiredAlerts}
                      onChange={(value) =>
                        updateSetting(
                          "expiredAlerts",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        📊 Daily Laboratory Summary
                      </div>

                      <div style={styles.settingDescription}>
                        Display a daily summary of laboratory activity.
                      </div>
                    </div>

                    <Toggle
                      value={settings.dailySummary}
                      onChange={(value) =>
                        updateSetting(
                          "dailySummary",
                          value
                        )
                      }
                    />

                  </div>

                </div>


                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>
                    💡
                  </span>

                  <div>
                    <b>Expiry monitoring</b>

                    <p>
                      Chemicals will be considered "expiring soon"
                      based on your selected expiry warning period.
                    </p>
                  </div>
                </div>


                <div style={styles.actionRow}>
                  <button
                    onClick={saveSettings}
                    style={styles.saveButton}
                  >
                    💾 Save Alert Preferences
                  </button>
                </div>

              </div>

            </div>

          )}


          {/* ISSUE SETTINGS */}

          {activeTab === "issues" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    📋 Issue Register Settings
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Configure how chemicals are issued and recorded
                  </p>
                </div>

              </div>


              <div style={styles.card}>

                <div style={styles.settingList}>

                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        👨‍🎓 Require Student Name
                      </div>

                      <div style={styles.settingDescription}>
                        Student name must be entered before issuing a chemical.
                      </div>
                    </div>

                    <Toggle
                      value={settings.requireStudentName}
                      onChange={(value) =>
                        updateSetting(
                          "requireStudentName",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        🔢 Require Roll Number
                      </div>

                      <div style={styles.settingDescription}>
                        Require student roll number in issue records.
                      </div>
                    </div>

                    <Toggle
                      value={settings.requireRollNumber}
                      onChange={(value) =>
                        updateSetting(
                          "requireRollNumber",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        📝 Require Issue Purpose
                      </div>

                      <div style={styles.settingDescription}>
                        Require users to specify why the chemical is needed.
                      </div>
                    </div>

                    <Toggle
                      value={settings.requirePurpose}
                      onChange={(value) =>
                        updateSetting(
                          "requirePurpose",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        🔄 Automatically Update Stock
                      </div>

                      <div style={styles.settingDescription}>
                        Automatically reduce inventory when chemicals are issued.
                      </div>
                    </div>

                    <Toggle
                      value={settings.autoUpdateStock}
                      onChange={(value) =>
                        updateSetting(
                          "autoUpdateStock",
                          value
                        )
                      }
                    />

                  </div>

                </div>


                <div style={styles.actionRow}>
                  <button
                    onClick={saveSettings}
                    style={styles.saveButton}
                  >
                    💾 Save Issue Settings
                  </button>
                </div>

              </div>

            </div>

          )}


          {/* APPEARANCE */}

          {activeTab === "appearance" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    🎨 Appearance
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Customize the ChemStock Pro interface
                  </p>
                </div>

              </div>


              <div style={styles.card}>

                <div style={styles.settingList}>

                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        🌙 Dark Interface
                      </div>

                      <div style={styles.settingDescription}>
                        Use the ChemStock Pro dark navy interface.
                      </div>
                    </div>

                    <Toggle
                      value={settings.darkMode}
                      onChange={(value) =>
                        updateSetting(
                          "darkMode",
                          value
                        )
                      }
                    />

                  </div>


                  <div style={styles.settingItem}>

                    <div>
                      <div style={styles.settingName}>
                        📐 Compact Layout
                      </div>

                      <div style={styles.settingDescription}>
                        Reduce spacing for a denser dashboard layout.
                      </div>
                    </div>

                    <Toggle
                      value={settings.compactMode}
                      onChange={(value) =>
                        updateSetting(
                          "compactMode",
                          value
                        )
                      }
                    />

                  </div>

                </div>


                <div style={styles.themePreview}>

                  <div style={styles.previewSidebar} />

                  <div style={styles.previewContent}>

                    <div style={styles.previewTitle} />

                    <div style={styles.previewCards}>

                      <div style={styles.previewCard} />

                      <div style={styles.previewCard} />

                      <div style={styles.previewCard} />

                    </div>

                  </div>

                </div>


                <div style={styles.actionRow}>
                  <button
                    onClick={saveSettings}
                    style={styles.saveButton}
                  >
                    💾 Save Appearance
                  </button>
                </div>

              </div>

            </div>

          )}


          {/* DATA */}

          {activeTab === "data" && (

            <div>

              <div style={styles.sectionHeader}>

                <div>
                  <h2 style={styles.sectionTitle}>
                    💾 Data & System
                  </h2>

                  <p style={styles.sectionSubtitle}>
                    Manage application data and system preferences
                  </p>
                </div>

              </div>


              <div style={styles.systemGrid}>


                <div style={styles.systemCard}>

                  <div style={styles.systemIcon}>
                    📤
                  </div>

                  <h3 style={styles.systemTitle}>
                    Export Settings
                  </h3>

                  <p style={styles.systemText}>
                    Download your ChemStock Pro configuration
                    as a backup file.
                  </p>

                  <button
                    onClick={exportSettings}
                    style={styles.secondaryButton}
                  >
                    Export Settings
                  </button>

                </div>


                <div style={styles.systemCard}>

                  <div style={styles.systemIcon}>
                    🔄
                  </div>

                  <h3 style={styles.systemTitle}>
                    Reset Settings
                  </h3>

                  <p style={styles.systemText}>
                    Restore all application preferences
                    to their default values.
                  </p>

                  <button
                    onClick={clearSettings}
                    style={styles.dangerButton}
                  >
                    Reset Settings
                  </button>

                </div>

              </div>


              <div style={styles.card}>

                <h3 style={styles.cardHeading}>
                  🧪 Application Information
                </h3>


                <div style={styles.infoRow}>
                  <span>Application</span>
                  <strong>ChemStock Pro</strong>
                </div>


                <div style={styles.infoRow}>
                  <span>System Type</span>
                  <strong>Laboratory Management System</strong>
                </div>


                <div style={styles.infoRow}>
                  <span>Data Storage</span>

                  <strong style={styles.connected}>
                    ● Connected
                  </strong>
                </div>


                <div style={styles.infoRow}>
                  <span>Version</span>
                  <strong>1.0.0</strong>
                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* SAVE MESSAGE */}

      {savedMessage && (
        <div style={styles.toast}>
          {savedMessage}
        </div>
      )}

    </div>
  );
}


/* =========================================
   STYLES
========================================= */

const styles = {

  page: {
    minHeight: "100vh",
    width: "100%",
    padding: "30px",
    boxSizing: "border-box",
    color: "#ffffff",
    fontFamily:
      "Inter, Arial, sans-serif",
    background:
      "linear-gradient(135deg, #07142d 0%, #10285a 45%, #123f91 100%)"
  },


  /* HEADER */

  header: {
    maxWidth: "1400px",
    margin: "0 auto 28px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  headerIcon: {
    width: "58px",
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #1e5bd8, #39a8ff)",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.25)"
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-1px"
  },

  subtitle: {
    margin: "7px 0 0 0",
    color: "#9eb3d8",
    fontSize: "15px"
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "25px",
    background:
      "rgba(20, 42, 82, 0.8)",
    border:
      "1px solid rgba(109, 154, 232, 0.2)",
    color: "#c6d8f5",
    fontSize: "14px"
  },

  liveDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#38d996",
    boxShadow:
      "0 0 12px #38d996"
  },


  /* LAYOUT */

  layout: {
    maxWidth: "1400px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns:
      "260px minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start"
  },


  /* SIDEBAR */

  sidebar: {
    position: "sticky",
    top: "20px",
    overflow: "hidden",
    borderRadius: "20px",
    padding: "14px",
    background:
      "linear-gradient(180deg, #101f3e, #0b1830)",
    border:
      "1px solid rgba(112, 148, 207, 0.15)",
    boxShadow:
      "0 18px 50px rgba(0,0,0,0.25)"
  },

  sidebarTitle: {
    padding: "12px 14px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#617ba8"
  },

  tabButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    border: "none",
    background: "transparent",
    color: "#aabbd8",
    padding: "13px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    marginBottom: "4px",
    transition: "0.2s"
  },

  activeTab: {
    color: "#ffffff",
    fontWeight: "700",
    background:
      "linear-gradient(90deg, #1c5fd7, #267ee8)",
    boxShadow:
      "0 8px 22px rgba(30,96,215,0.3)"
  },

  tabIcon: {
    fontSize: "17px"
  },

  activeArrow: {
    marginLeft: "auto",
    fontSize: "23px"
  },

  sidebarBottom: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop:
      "1px solid rgba(100,130,180,0.15)"
  },

  connectionCard: {
    display: "flex",
    gap: "10px",
    padding: "13px",
    borderRadius: "13px",
    background:
      "rgba(42, 82, 148, 0.18)"
  },

  connectionIcon: {
    fontSize: "22px"
  },

  connectionTitle: {
    fontWeight: "700",
    fontSize: "13px"
  },

  connectionText: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#7488ad",
    lineHeight: "1.4"
  },


  /* CONTENT */

  content: {
    minWidth: 0
  },

  sectionHeader: {
    marginBottom: "18px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "750"
  },

  sectionSubtitle: {
    margin: "7px 0 0 0",
    color: "#91a6cc",
    fontSize: "14px"
  },


  /* CARDS */

  card: {
    padding: "25px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, #142747, #0c1931)",
    border:
      "1px solid rgba(106, 143, 207, 0.16)",
    boxShadow:
      "0 18px 45px rgba(0,0,0,0.22)"
  },

  cardHeading: {
    margin: "0 0 18px 0",
    fontSize: "18px"
  },


  /* FORM */

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px"
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  label: {
    fontSize: "13px",
    fontWeight: "650",
    color: "#c9d6eb"
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "11px",
    outline: "none",
    color: "#eaf2ff",
    fontSize: "14px",
    background: "#09172d",
    border:
      "1px solid #263f68"
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "90px",
    resize: "vertical",
    padding: "13px 14px",
    borderRadius: "11px",
    outline: "none",
    color: "#eaf2ff",
    fontSize: "14px",
    background: "#09172d",
    border:
      "1px solid #263f68"
  },

  helperText: {
    color: "#7185a8",
    fontSize: "11px",
    lineHeight: "1.5"
  },


  /* SETTING ITEMS */

  settingList: {
    display: "flex",
    flexDirection: "column"
  },

  settingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "19px 0",
    borderBottom:
      "1px solid rgba(100,130,180,0.13)"
  },

  settingName: {
    color: "#e6eefc",
    fontWeight: "700",
    fontSize: "15px"
  },

  settingDescription: {
    marginTop: "6px",
    color: "#8295b7",
    fontSize: "12px",
    lineHeight: "1.5"
  },


  /* TOGGLE */

  toggle: {
    position: "relative",
    width: "48px",
    height: "26px",
    minWidth: "48px",
    borderRadius: "30px",
    border: "none",
    padding: "3px",
    cursor: "pointer",
    transition: "0.2s"
  },

  toggleCircle: {
    width: "20px",
    height: "20px",
    background: "#ffffff",
    borderRadius: "50%",
    transition: "0.2s",
    boxShadow:
      "0 2px 5px rgba(0,0,0,0.3)"
  },


  /* BUTTONS */

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "25px"
  },

  saveButton: {
    border: "none",
    padding: "13px 22px",
    borderRadius: "11px",
    cursor: "pointer",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    background:
      "linear-gradient(135deg, #1976e8, #28a9e8)",
    boxShadow:
      "0 8px 22px rgba(31,120,230,0.3)"
  },

  secondaryButton: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#b9d5ff",
    fontWeight: "600",
    background: "#13294d",
    border:
      "1px solid #28518a"
  },

  dangerButton: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#ffb7b7",
    fontWeight: "600",
    background:
      "rgba(180, 45, 60, 0.15)",
    border:
      "1px solid rgba(235, 80, 90, 0.35)"
  },


  /* INFO */

  infoBox: {
    display: "flex",
    gap: "13px",
    marginTop: "22px",
    padding: "16px",
    borderRadius: "13px",
    background:
      "rgba(30, 93, 190, 0.12)",
    border:
      "1px solid rgba(65, 132, 235, 0.2)"
  },

  infoIcon: {
    fontSize: "21px"
  },


  /* DATA SYSTEM */

  systemGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px"
  },

  systemCard: {
    padding: "22px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, #142747, #0d1a33)",
    border:
      "1px solid rgba(100,140,210,0.16)"
  },

  systemIcon: {
    fontSize: "30px",
    marginBottom: "13px"
  },

  systemTitle: {
    margin: 0,
    fontSize: "17px"
  },

  systemText: {
    minHeight: "42px",
    color: "#8497b9",
    fontSize: "13px",
    lineHeight: "1.6"
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "16px 0",
    borderBottom:
      "1px solid rgba(100,130,180,0.13)",
    color: "#91a4c5",
    fontSize: "14px"
  },

  connected: {
    color: "#4ade80"
  },


  /* THEME PREVIEW */

  themePreview: {
    height: "150px",
    display: "flex",
    overflow: "hidden",
    marginTop: "25px",
    borderRadius: "14px",
    border:
      "1px solid rgba(100,140,200,0.2)",
    background: "#07142a"
  },

  previewSidebar: {
    width: "90px",
    background:
      "linear-gradient(180deg, #152d57, #0b1830)",
    borderRight:
      "1px solid rgba(100,140,200,0.2)"
  },

  previewContent: {
    flex: 1,
    padding: "20px"
  },

  previewTitle: {
    width: "150px",
    height: "14px",
    borderRadius: "8px",
    background: "#2d65ba",
    marginBottom: "20px"
  },

  previewCards: {
    display: "flex",
    gap: "12px"
  },

  previewCard: {
    width: "100px",
    height: "65px",
    borderRadius: "10px",
    background: "#122544",
    border:
      "1px solid rgba(100,140,200,0.12)"
  },


  /* TOAST */

  toast: {
    position: "fixed",
    right: "30px",
    bottom: "30px",
    zIndex: 100,
    padding: "14px 20px",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    background:
      "linear-gradient(135deg, #159957, #38c982)",
    boxShadow:
      "0 12px 35px rgba(0,0,0,0.3)"
  }
};