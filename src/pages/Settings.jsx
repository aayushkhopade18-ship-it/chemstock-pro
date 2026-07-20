import Sidebar from "../components/Sidebar";

function Settings() {
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
        <h1>⚙️ Laboratory Settings</h1>

        <div
          style={{
            background: "#1e293b",
            borderRadius: "20px",
            padding: "30px",
            marginTop: "30px",
            maxWidth: "700px",
          }}
        >
          <input style={input} placeholder="Laboratory Name" />

          <input style={input} placeholder="College Name" />

          <input style={input} placeholder="Department" />

          <input style={input} placeholder="Lab Incharge" />

          <input style={input} placeholder="Contact Number" />

          <input style={input} placeholder="Email Address" />

          <button style={button}>
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}

const input = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
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

export default Settings;