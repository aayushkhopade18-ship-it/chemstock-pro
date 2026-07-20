import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChemicalContext } from "../context/ChemicalContext";

function AddChemical() {
  const { addChemical } = useContext(ChemicalContext);
  const navigate = useNavigate();

  const [chemical, setChemical] = useState({
    name: "",
    formula: "",
    category: "Acid",
    quantity: "",
    unit: "",
    location: "",
    expiry: "",
    supplier: "",
  });

  const handleChange = (e) => {
    setChemical({
      ...chemical,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      chemical.name.trim() === "" ||
      chemical.formula.trim() === "" ||
      chemical.quantity.trim() === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    await addChemical(chemical);

    alert("Chemical Saved Successfully ✅");

    navigate("/inventory");
  };

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
        <h1>➕ Add Chemical</h1>

        <div
          style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "700px",
            marginTop: "30px",
          }}
        >
          <input
            style={input}
            placeholder="Chemical Name"
            name="name"
            value={chemical.name}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Formula"
            name="formula"
            value={chemical.formula}
            onChange={handleChange}
          />

          <select
            style={input}
            name="category"
            value={chemical.category}
            onChange={handleChange}
          >
            <option>Acid</option>
            <option>Base</option>
            <option>Salt</option>
            <option>Solvent</option>
            <option>Indicator</option>
            <option>Organic</option>
            <option>Inorganic</option>
            <option>Glassware</option>
            <option>Equipment</option>
          </select>

          <input
            style={input}
            placeholder="Quantity"
            name="quantity"
            value={chemical.quantity}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Unit"
            name="unit"
            value={chemical.unit}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Shelf Location"
            name="location"
            value={chemical.location}
            onChange={handleChange}
          />

          <input
            style={input}
            type="date"
            name="expiry"
            value={chemical.expiry}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Supplier"
            name="supplier"
            value={chemical.supplier}
            onChange={handleChange}
          />

          <button style={button} onClick={handleSubmit}>
            Save Chemical
          </button>
        </div>
      </div>
    </>
  );
}

const input = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
  boxSizing: "border-box",
};

const button = {
  width: "100%",
  padding: "15px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "18px",
  cursor: "pointer",
};

export default AddChemical;