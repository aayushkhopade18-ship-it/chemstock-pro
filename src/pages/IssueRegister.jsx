import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { IssueContext } from "../context/IssueContext";

function IssueRegister() {
  const { issues } = useContext(IssueContext);

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
        <h1>📦 Chemical Issue Register</h1>

        <div
          style={{
            background: "#1e293b",
            borderRadius: "20px",
            padding: "20px",
            marginTop: "30px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#334155",
              }}
            >
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Student</th>
                <th style={th}>Roll No</th>
                <th style={th}>Department</th>
                <th style={th}>Chemical</th>
                <th style={th}>Quantity</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.date}</td>
                  <td style={td}>{item.student}</td>
                  <td style={td}>{item.roll}</td>
                  <td style={td}>{item.department}</td>
                  <td style={td}>{item.chemical}</td>
                  <td style={td}>{item.quantity}</td>
                </tr>
              ))}

              {issues.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    No Issue Records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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

export default IssueRegister;