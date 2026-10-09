import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTrashAlt,
  FaFlask,
  FaExclamationTriangle,
  FaBoxes,
  FaClipboardList,
  FaMicroscope,
  FaTruck,
  FaCheckCircle,
  FaInfoCircle,
  FaLightbulb,
  FaCopy,
  FaSearch,
  FaCalendarTimes,
  FaUserCheck,
  FaShieldAlt,
} from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";

import { ChemicalContext } from "../context/ChemicalContext";
import { IssueContext } from "../context/IssueContext";
import { InstrumentContext } from "../context/InstrumentContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";

export default function LabCopilot() {
  const { chemicals = [] } = useContext(ChemicalContext);
  const { issues = [] } = useContext(IssueContext);
  const { instruments = [] } = useContext(InstrumentContext);
  const { collegeId, user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your ChemStock AI Lab Copilot. I have live access to your laboratory chemicals, equipment, issue logs, and supplier records. What would you like to analyze or locate?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const chatEndRef = useRef(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Real-time multi-tenant suppliers fetch */
  useEffect(() => {
    if (!collegeId) return;
    const supRef = collection(db, "colleges", collegeId, "suppliers");
    const unsubscribe = onSnapshot(supRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSuppliers(list);
    });
    return () => unsubscribe();
  }, [collegeId]);

  /* =========================================================
     LIVE INVENTORY ANALYTICS
  ========================================================= */
  const getDaysLeft = (expiry) => {
    if (!expiry) return null;
    const parts = expiry.split("-");
    let expDate;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        expDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      expDate = new Date(expiry);
    }
    if (isNaN(expDate.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    return Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
  };

  const expiredList = useMemo(
    () => chemicals.filter((c) => {
      const d = getDaysLeft(c.expiry);
      return d !== null && d < 0;
    }),
    [chemicals]
  );

  const expiringSoonList = useMemo(
    () => chemicals.filter((c) => {
      const d = getDaysLeft(c.expiry);
      return d !== null && d >= 0 && d <= 30;
    }),
    [chemicals]
  );

  const lowStockList = useMemo(
    () => chemicals.filter((c) => {
      const q = Number(c.quantity);
      const min = Number(c.minimumStock || c.minStock || 0);
      return !isNaN(q) && min > 0 && q <= min;
    }),
    [chemicals]
  );

  /* =========================================================
     INTELLIGENT NATURAL LANGUAGE PROCESSOR (NLP)
  ========================================================= */
  const processQuery = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. GREETINGS & CASUAL
    if (/^(hi|hello|hey|greetings|who are you|help)/i.test(q)) {
      return {
        text: `Hello ${user?.email?.split("@")[0] || "Professor"}! I am connected to **${collegeId?.toUpperCase().replace("_", " ") || "Campus"}** live records.\n\nYou can ask me:\n• Stock inquiries: *"What chemicals are low in stock?"*\n• Expiry checks: *"Which chemicals are expired?"*\n• Specific Reagents: *"Where is Hydrochloric acid stored?"*\n• Dispense History: *"Who took chemicals recently?"*\n• Procurement: *"Show supplier contact details"*`,
      };
    }

    // 2. OVERALL INVENTORY SUMMARY / AUDIT
    if (q.includes("summary") || q.includes("overview") || q.includes("audit") || q.includes("health")) {
      return {
        type: "card",
        title: "Laboratory Inventory Health Summary",
        summaryData: [
          { label: "Total Chemicals Cataloged", value: chemicals.length },
          { label: "Low Stock Items", value: lowStockList.length, alert: lowStockList.length > 0 },
          { label: "Expired Substances", value: expiredList.length, alert: expiredList.length > 0 },
          { label: "Expiring within 30 Days", value: expiringSoonList.length },
          { label: "Total Issue Records", value: issues.length },
          { label: "Laboratory Instruments", value: instruments.length },
        ],
        text: `Here is the current state of **${collegeId?.toUpperCase().replace("_", " ")}**:\n` +
          `• **${chemicals.length}** chemicals currently registered.\n` +
          `• **${lowStockList.length}** items requiring restock.\n` +
          `• **${expiredList.length}** expired compounds requiring safe disposal.`,
      };
    }

    // 3. EXPIRED CHEMICALS
    if (q.includes("expired") || q.includes("expiry alert") || q.includes("past expiry")) {
      if (expiredList.length === 0) {
        return { text: "✅ **No expired chemicals!** All substances currently meet laboratory shelf-life requirements." };
      }
      return {
        type: "table",
        title: `⚠️ Expired Chemicals (${expiredList.length} Detected)`,
        headers: ["Chemical", "Formula", "Stock", "Location", "Expired Date"],
        rows: expiredList.map((c) => [
          c.name,
          c.formula || "—",
          `${c.quantity} ${c.unit}`,
          c.location || "Main Cabinet",
          c.expiry || "N/A",
        ]),
        text: `Warning: Found **${expiredList.length} expired substance(s)** in your campus inventory. These should be neutralized or safely disposed of immediately.`,
      };
    }

    // 4. EXPIRING SOON
    if (q.includes("expiring soon") || q.includes("shelf life") || q.includes("near expiry")) {
      if (expiringSoonList.length === 0) {
        return { text: "✅ **No chemicals expiring in the next 30 days.** Stock is safe for current semester usage." };
      }
      return {
        type: "table",
        title: `⏳ Chemicals Expiring Within 30 Days (${expiringSoonList.length})`,
        headers: ["Chemical", "Formula", "Stock", "Location", "Days Left"],
        rows: expiringSoonList.map((c) => [
          c.name,
          c.formula || "—",
          `${c.quantity} ${c.unit}`,
          c.location || "Main Cabinet",
          `${getDaysLeft(c.expiry)} days`,
        ]),
        text: `There are **${expiringSoonList.length} chemical(s)** expiring within 30 days. Prioritize these for practical classes.`,
      };
    }

    // 5. LOW STOCK / PURCHASE RECOMMENDATION
    if (q.includes("low stock") || q.includes("purchase") || q.includes("reorder") || q.includes("buy") || q.includes("shortage")) {
      if (lowStockList.length === 0) {
        return { text: "✅ **Stock levels are healthy!** All chemicals are currently above their minimum threshold alert." };
      }
      return {
        type: "table",
        title: `🛒 Reorder List (${lowStockList.length} Items Below Threshold)`,
        headers: ["Chemical", "Current Stock", "Min Threshold", "Location", "Supplier"],
        rows: lowStockList.map((c) => [
          c.name,
          `${c.quantity} ${c.unit}`,
          `${c.minimumStock || c.minStock} ${c.unit}`,
          c.location || "Main Cabinet",
          c.supplier || "Supplier Directory",
        ]),
        text: `The following **${lowStockList.length} chemical(s)** are at or below safety stock levels and should be requisitioned:`,
      };
    }

    // 6. ALL CHEMICALS LISTING
    if (q.includes("show all chemicals") || q.includes("list chemicals") || q.includes("all chemicals") || q.includes("how many chemicals")) {
      if (chemicals.length === 0) {
        return { text: "No chemicals registered yet in this campus database. Head to **Add Chemical** to add your first entry." };
      }
      return {
        type: "table",
        title: `🧪 Campus Inventory (${chemicals.length} Total Compounds)`,
        headers: ["Chemical Name", "Formula", "Category", "Quantity", "Location"],
        rows: chemicals.slice(0, 15).map((c) => [
          c.name,
          c.formula || "—",
          c.category || "General",
          `${c.quantity} ${c.unit}`,
          c.location || "Main Cabinet",
        ]),
        text: `Here is an overview of chemicals in stock (showing ${Math.min(chemicals.length, 15)} of ${chemicals.length}):`,
      };
    }

    // 7. SPECIFIC CHEMICAL SEARCH (e.g., "Where is Acetone?", "Tell me about CuSO4")
    const matchedChem = chemicals.find((c) => {
      const name = (c.name || "").toLowerCase();
      const formula = (c.formula || "").toLowerCase();
      return (
        name.length > 2 && q.includes(name) ||
        (formula.length >= 2 && q.split(" ").some((w) => w === formula))
      );
    });

    if (matchedChem) {
      const days = getDaysLeft(matchedChem.expiry);
      return {
        type: "chemDetail",
        title: `Compound Record: ${matchedChem.name}`,
        chemical: matchedChem,
        daysLeft: days,
        text: `Found chemical dossier for **${matchedChem.name}** in **${matchedChem.location || "Main Cabinet"}**:`,
      };
    }

    // 8. ISSUES & DISPENSING HISTORY
    if (q.includes("issue") || q.includes("who took") || q.includes("dispense") || q.includes("consumption")) {
      if (issues.length === 0) {
        return { text: "No chemical issues recorded yet in your campus register." };
      }
      return {
        type: "table",
        title: `📋 Recent Chemical Issues (${issues.length} Total Logs)`,
        headers: ["Date", "Chemical", "Issued To", "Department", "Qty Issued"],
        rows: issues.slice(0, 8).map((i) => [
          i.issueDate || "Recent",
          i.chemicalName || "—",
          i.issuedTo || "Faculty/Student",
          i.department || "General",
          `${i.quantityIssued || i.quantity} ${i.unit || "units"}`,
        ]),
        text: `Here are the latest recorded laboratory issues:`,
      };
    }

    // 9. SUPPLIER INFORMATION
    if (q.includes("supplier") || q.includes("vendor") || q.includes("contact number") || q.includes("phone")) {
      if (suppliers.length === 0) {
        return { text: "No suppliers registered yet in your campus Supplier Directory. You can register them via **Add Chemical** or the **Suppliers** section." };
      }
      return {
        type: "table",
        title: `🚚 Registered Campus Suppliers (${suppliers.length})`,
        headers: ["Company Name", "Contact Person", "Phone", "Email", "City/Address"],
        rows: suppliers.map((s) => [
          s.supplierName || s.name || "Vendor",
          s.contactPerson || s.contact || "Representative",
          s.phone || s.phoneNumber || "—",
          s.email || "—",
          s.address || "—",
        ]),
        text: `Here are the active chemical vendors registered for this campus:`,
      };
    }

    // 10. INSTRUMENTS & EQUIPMENT
    if (q.includes("instrument") || q.includes("equipment") || q.includes("machine") || q.includes("spectrophotometer")) {
      if (instruments.length === 0) {
        return { text: "No instruments currently cataloged in the laboratory equipment register." };
      }
      return {
        type: "table",
        title: `🔬 Laboratory Equipment (${instruments.length} Total Units)`,
        headers: ["Instrument", "Model", "Serial No.", "Location", "Status"],
        rows: instruments.map((ins) => [
          ins.instrumentName || ins.name,
          ins.model || "—",
          ins.serialNumber || "—",
          ins.location || "Apparatus Room",
          ins.status || "Operational",
        ]),
        text: `Found **${instruments.length} piece(s) of laboratory equipment** registered:`,
      };
    }

    // 11. CATEGORY FILTERS (ACIDS / BASES / SOLVENTS)
    if (q.includes("acid")) {
      const acids = chemicals.filter((c) => /acid/i.test(c.category || "") || /acid/i.test(c.name || ""));
      return {
        type: "table",
        title: `🧪 Acids in Inventory (${acids.length})`,
        headers: ["Chemical", "Formula", "Stock", "Location"],
        rows: acids.map((c) => [c.name, c.formula || "—", `${c.quantity} ${c.unit}`, c.location || "Acid Cabinet"]),
        text: `Found **${acids.length} acid reagents** in stock:`,
      };
    }
    if (q.includes("base") || q.includes("alkali")) {
      const bases = chemicals.filter((c) => /base|hydroxide|alkali/i.test(c.category || "") || /hydroxide/i.test(c.name || ""));
      return {
        type: "table",
        title: `🧪 Bases in Inventory (${bases.length})`,
        headers: ["Chemical", "Formula", "Stock", "Location"],
        rows: bases.map((c) => [c.name, c.formula || "—", `${c.quantity} ${c.unit}`, c.location || "Base Cabinet"]),
        text: `Found **${bases.length} alkaline reagents** in stock:`,
      };
    }
    if (q.includes("solvent")) {
      const solvents = chemicals.filter((c) => /solvent|alcohol|acetone|ether/i.test(c.category || "") || /acetone|ethanol/i.test(c.name || ""));
      return {
        type: "table",
        title: `🧪 Organic Solvents (${solvents.length})`,
        headers: ["Chemical", "Formula", "Stock", "Location"],
        rows: solvents.map((c) => [c.name, c.formula || "—", `${c.quantity} ${c.unit}`, c.location || "Flammables Cabinet"]),
        text: `Found **${solvents.length} solvents** in stock:`,
      };
    }

    // DEFAULT FALLBACK
    return {
      text: `I couldn't find an exact match for *"${rawQuery}"*.\n\nTry asking me:\n• *"What chemicals are low in stock?"*\n• *"Which chemicals are expired?"*\n• *"Show all acids"* or *"Show all solvents"*\n• *"Who took Hydrochloric Acid?"*\n• *"Show registered suppliers"*`,
    };
  };

  /* =========================================================
     MESSAGE SEND HANDLER
  ========================================================= */
  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(query);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ...result,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 400);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Chat cleared. Ready for your next inventory analysis or search query!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const QUICK_PROMPTS = [
    "What chemicals are low in stock?",
    "Which chemicals are expired?",
    "Give me an inventory summary",
    "Show all chemicals",
    "Who took chemicals recently?",
    "Show supplier contact details",
    "Show all acids",
    "Equipment operational status",
  ];

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />

      {/* Top Banner */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.badge}>
            CAMPUS AI ENGINE • {collegeId ? collegeId.toUpperCase().replace("_", " ") : "ACTIVE CAMPUS"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <h1 style={styles.pageTitle}>Lab Copilot</h1>
            <span style={styles.onlinePill}>
              <span style={styles.dot} /> Live Data Synced
            </span>
          </div>
          <p style={styles.pageSubtitle}>
            AI-driven inventory intelligence, expiry audits, safety checks & consumption analytics.
          </p>
        </div>

        <button onClick={clearChat} style={styles.clearBtn} title="Clear conversation history">
          <FaTrashAlt /> Clear Chat
        </button>
      </div>

      {/* Metric Strip */}
      <div style={styles.metricStrip}>
        <div style={styles.metricItem}>
          <FaBoxes style={{ color: "#38bdf8", fontSize: "16px" }} />
          <div>
            <div style={styles.metricVal}>{chemicals.length}</div>
            <div style={styles.metricLabel}>Chemicals</div>
          </div>
        </div>

        <div style={styles.metricItem}>
          <FaExclamationTriangle style={{ color: lowStockList.length > 0 ? "#f87171" : "#4ade80", fontSize: "16px" }} />
          <div>
            <div style={{ ...styles.metricVal, color: lowStockList.length > 0 ? "#f87171" : "#f8fafc" }}>
              {lowStockList.length}
            </div>
            <div style={styles.metricLabel}>Low Stock</div>
          </div>
        </div>

        <div style={styles.metricItem}>
          <FaCalendarTimes style={{ color: expiredList.length > 0 ? "#fbbf24" : "#4ade80", fontSize: "16px" }} />
          <div>
            <div style={{ ...styles.metricVal, color: expiredList.length > 0 ? "#fbbf24" : "#f8fafc" }}>
              {expiredList.length}
            </div>
            <div style={styles.metricLabel}>Expired</div>
          </div>
        </div>

        <div style={styles.metricItem}>
          <FaClipboardList style={{ color: "#a78bfa", fontSize: "16px" }} />
          <div>
            <div style={styles.metricVal}>{issues.length}</div>
            <div style={styles.metricLabel}>Issue Records</div>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div style={styles.mainGrid}>
        {/* Left: Chat Container */}
        <div style={styles.chatCard}>
          {/* Scrollable Message Box */}
          <div style={styles.messageList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.sender === "ai" && (
                  <div style={styles.aiAvatar}>
                    <FaRobot />
                  </div>
                )}

                <div
                  style={{
                    ...styles.bubble,
                    background: msg.sender === "user" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "rgba(15, 23, 42, 0.85)",
                    border: msg.sender === "user" ? "none" : "1px solid rgba(148, 163, 184, 0.18)",
                  }}
                >
                  <div style={styles.bubbleHeader}>
                    <span style={styles.senderLabel}>
                      {msg.sender === "user" ? "You" : "Lab Copilot"}
                    </span>
                    <span style={styles.timeLabel}>{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <p style={styles.bubbleText}>{msg.text}</p>

                  {/* Render Table Card */}
                  {msg.type === "table" && (
                    <div style={styles.embeddedTableCard}>
                      <div style={styles.tableCardHeader}>{msg.title}</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              {msg.headers.map((h, i) => (
                                <th key={i} style={styles.tableTh}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.rows.map((row, rIdx) => (
                              <tr key={rIdx} style={styles.tableTr}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} style={styles.tableTd}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Render Summary Card */}
                  {msg.type === "card" && (
                    <div style={styles.summaryEmbed}>
                      <div style={styles.summaryEmbedTitle}>{msg.title}</div>
                      <div style={styles.summaryGrid}>
                        {msg.summaryData.map((item, idx) => (
                          <div key={idx} style={styles.summaryCell}>
                            <span style={styles.summaryCellVal}>
                              {item.value}
                            </span>
                            <span style={styles.summaryCellLabel}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Chemical Detail Dossier */}
                  {msg.type === "chemDetail" && (
                    <div style={styles.chemDossier}>
                      <div style={styles.dossierTitle}>
                        <FaFlask style={{ color: "#38bdf8" }} /> {msg.chemical.name}
                        {msg.chemical.formula && (
                          <span style={styles.dossierFormula}>({msg.chemical.formula})</span>
                        )}
                      </div>

                      <div style={styles.dossierGrid}>
                        <div><strong>Stock:</strong> {msg.chemical.quantity} {msg.chemical.unit}</div>
                        <div><strong>Location:</strong> {msg.chemical.location || "Main Cabinet"}</div>
                        <div><strong>Category:</strong> {msg.chemical.category || "General Reagent"}</div>
                        <div><strong>Supplier:</strong> {msg.chemical.supplier || "Supplier Directory"}</div>
                        <div><strong>Expiry:</strong> {msg.chemical.expiry || "N/A"}</div>
                        <div><strong>Days Remaining:</strong> {msg.daysLeft !== null ? `${msg.daysLeft} days` : "N/A"}</div>
                      </div>

                      {msg.chemical.safetyData && (
                        <div style={styles.dossierSafety}>
                          <FaShieldAlt style={{ color: "#f59e0b" }} />
                          <span>
                            <strong>Storage Protocol:</strong> {msg.chemical.safetyData.storage || "Cool, dry chemical shelf."}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  <div style={styles.msgFooter}>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      style={styles.copyBtn}
                    >
                      <FaCopy /> {copiedId === msg.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={styles.typingRow}>
                <div style={styles.aiAvatar}>
                  <FaRobot />
                </div>
                <div style={styles.typingBubble}>
                  <span style={styles.typingDot} />
                  <span style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div style={styles.quickPromptRow}>
            {QUICK_PROMPTS.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                style={styles.promptChip}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={styles.inputContainer}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lab Copilot anything... (e.g. Which chemicals are low in stock?)"
              style={styles.chatInput}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                ...styles.sendBtn,
                opacity: input.trim() ? 1 : 0.6,
                cursor: input.trim() ? "pointer" : "not-allowed",
              }}
            >
              <FaPaperPlane /> Send
            </button>
          </form>
        </div>

        {/* Right: Insights & Quick Actions Sidebar */}
        <div style={styles.sideCol}>
          {/* Quick Actions Panel */}
          <div style={styles.sideCard}>
            <div style={styles.sideCardHeader}>
              <FaLightbulb style={{ color: "#38bdf8" }} />
              <h3 style={styles.sideTitle}>Suggested Inquiries</h3>
            </div>
            <p style={styles.sideDesc}>Click any prompt to instantly query your live campus dataset:</p>

            <div style={styles.actionPillGrid}>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  style={styles.sideActionBtn}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities Guide */}
          <div style={styles.sideCard}>
            <div style={styles.sideCardHeader}>
              <FaCheckCircle style={{ color: "#34d399" }} />
              <h3 style={styles.sideTitle}>Copilot Capabilities</h3>
            </div>
            <ul style={styles.capList}>
              <li>
                <strong>Stock Intelligence:</strong> Real-time tracking of chemicals, reorder triggers, and depletion alerts.
              </li>
              <li>
                <strong>Safety & MSDS:</strong> Storage protocols, hazard ratings, and required protective gear.
              </li>
              <li>
                <strong>Consumption Audit:</strong> Full issue histories by student, faculty, or department.
              </li>
              <li>
                <strong>Procurement:</strong> Direct contact lookups from your campus Supplier Directory.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 40px",
    background: "linear-gradient(135deg, #071126 0%, #0B1E42 45%, #102A63 100%)",
    color: "#FFFFFF",
    fontFamily: "'Inter', Arial, sans-serif",
    position: "relative",
    boxSizing: "border-box",
  },
  glowOne: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)",
    top: "-150px",
    right: "-100px",
    pointerEvents: "none",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
    gap: "12px",
  },
  badge: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  onlinePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.3)",
    color: "#86efac",
    fontSize: "11px",
    fontWeight: "700",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
  },
  pageSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(15,23,42,0.6)",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
  },
  metricStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },
  metricItem: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "12px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  metricVal: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
    gap: "20px",
    position: "relative",
    zIndex: 1,
  },
  chatCard: {
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    height: "680px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    paddingRight: "8px",
    marginBottom: "14px",
  },
  messageRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  aiAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "rgba(56,189,248,0.2)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: "14px",
    padding: "14px 18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },
  bubbleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  senderLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
  },
  timeLabel: {
    fontSize: "10px",
    color: "#64748b",
  },
  bubbleText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#f8fafc",
    whiteSpace: "pre-wrap",
  },
  embeddedTableCard: {
    marginTop: "12px",
    background: "rgba(2, 6, 23, 0.4)",
    borderRadius: "10px",
    padding: "10px",
    border: "1px solid rgba(148, 163, 184, 0.12)",
  },
  tableCardHeader: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
    textAlign: "left",
  },
  tableTh: {
    padding: "6px 8px",
    color: "#94a3b8",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  tableTr: {
    borderBottom: "1px solid rgba(148,163,184,0.06)",
  },
  tableTd: {
    padding: "6px 8px",
    color: "#e2e8f0",
  },
  summaryEmbed: {
    marginTop: "12px",
    background: "rgba(2, 6, 23, 0.45)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "10px",
    padding: "12px",
  },
  summaryEmbedTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: "10px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  summaryCell: {
    background: "rgba(15, 23, 42, 0.6)",
    padding: "8px",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
  },
  summaryCellVal: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  summaryCellLabel: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  chemDossier: {
    marginTop: "12px",
    background: "rgba(2, 6, 23, 0.45)",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    borderRadius: "10px",
    padding: "12px",
  },
  dossierTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  dossierFormula: {
    fontFamily: "monospace",
    color: "#cbd5e1",
    fontSize: "12px",
  },
  dossierGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    fontSize: "11px",
    color: "#cbd5e1",
  },
  dossierSafety: {
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(148,163,184,0.12)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: "#fcd34d",
  },
  msgFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "10px",
    cursor: "pointer",
  },
  typingRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  typingBubble: {
    display: "flex",
    gap: "4px",
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#38bdf8",
    opacity: 0.7,
  },
  quickPromptRow: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "8px",
    marginBottom: "8px",
  },
  promptChip: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    color: "#cbd5e1",
    fontSize: "11px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "4px",
  },
  chatInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(2, 6, 23, 0.4)",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
  },
  sendBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
  },
  sideCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sideCard: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: "18px",
    padding: "20px",
    backdropFilter: "blur(14px)",
  },
  sideCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  sideTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  sideDesc: {
    margin: "0 0 12px 0",
    fontSize: "11px",
    color: "#94a3b8",
  },
  actionPillGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sideActionBtn: {
    textAlign: "left",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(2, 6, 23, 0.35)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    color: "#cbd5e1",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  capList: {
    margin: 0,
    paddingLeft: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "11px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
};