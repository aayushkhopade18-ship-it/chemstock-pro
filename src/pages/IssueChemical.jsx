import { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import { ChemicalContext } from "../context/ChemicalContext";
import { IssueContext } from "../context/IssueContext";

function IssueChemical() {
  const { chemicals, reduceStock } = useContext(ChemicalContext);
  const { issueChemical } = useContext(IssueContext);

  const [issue, setIssue] = useState({
    student: "",
    roll: "",
    department: "",
    chemical: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setIssue({
      ...issue,
      [e.target.name]: e.target.value,
    });
  };

  const handleIssue = async () => {
    if (
      issue.student.trim() === "" ||
      issue.roll.trim() === "" ||
      issue.department.trim() === "" ||
      issue.chemical.trim() === "" ||
      issue.quantity.trim() === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await issueChemical(issue);

      await reduceStock(
        issue.chemical,
        issue.quantity
      );

      alert("Chemical Issued Successfully ✅");

      setIssue({
        student: "",
        roll: "",
        department: "",
        chemical: "",
        quantity: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to issue chemical");
    }
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
        <h1>🧪 Issue Chemical</h1>

        <div
          style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "700px",
            marginTop: "25px",
          }}
        >
          <input
            style={input}
            placeholder="Student Name"
            name="student"
            value={issue.student}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Roll Number"
            name="roll"
            value={issue.roll}
            onChange={handleChange}
          />

          <input
            style={input}
            placeholder="Department"
            name="department"
            value={issue.department}
            onChange={handleChange}
          />

          <select
            style={input}
            name="chemical"
            value={issue.chemical}
            onChange={handleChange}
          >
            <option value="">
              Select Chemical
            </option>

            {chemicals.map((item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>

          <input
            style={input}
            placeholder="Quantity Issued"
            name="quantity"
            type="number"
            value={issue.quantity}
            onChange={handleChange}
          />

          <button
            style={button}
            onClick={handleIssue}
          >
            Issue Chemical
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
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "18px",
  cursor: "pointer",
};

export default IssueChemical;