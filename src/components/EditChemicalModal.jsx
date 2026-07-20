import { useState, useEffect } from "react";

function EditChemicalModal({ chemical, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    formula: "",
    quantity: "",
    unit: "",
    location: "",
    expiry: "",
    supplier: "",
  });

  useEffect(() => {
    if (chemical) {
      setForm(chemical);
    }
  }, [chemical]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  if (!chemical) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "650px",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "20px",
          color: "white",
        }}
      >
        <h2>Edit Chemical</h2>

        <input
          style={input}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Chemical Name"
        />

        <input
          style={input}
          name="formula"
          value={form.formula}
          onChange={handleChange}
          placeholder="Formula"
        />

        <input
          style={input}
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
        />

        <input
          style={input}
          name="unit"
          value={form.unit}
          onChange={handleChange}
          placeholder="Unit"
        />

        <input
          style={input}
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Shelf"
        />

        <input
          style={input}
          type="date"
          name="expiry"
          value={form.expiry}
          onChange={handleChange}
        />

        <input
          style={input}
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          placeholder="Supplier"
        />

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "15px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Save
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "15px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
  boxSizing: "border-box",
};

export default EditChemicalModal;