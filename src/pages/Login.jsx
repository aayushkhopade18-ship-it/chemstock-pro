import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFlask, FaEye, FaEyeSlash } from "react-icons/fa";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter Email and Password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      let role = "student";

      if (email === "admin@chemstock.com") {
        role = "admin";
      } else if (email === "assistant@chemstock.com") {
        role = "assistant";
      }

      localStorage.setItem("role", role);

      alert("Login Successful ✅");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.code);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <FaFlask />
        </div>

        <h1 className="title">
          ChemStock Pro
        </h1>

        <p className="subtitle">
          Professional Chemistry Laboratory Management
        </p>

        <input
          className="input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#444",
              fontSize: "18px",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          LOGIN
        </button>

        <div
          className="footer"
          style={{
            textAlign: "center",
            marginTop: "25px",
            lineHeight: "1.7",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            ChemStock Pro v1.0
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              marginTop: "5px",
            }}
          >
            Designed &amp; Developed by
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#38bdf8",
            }}
          >
            Aayush Khopade
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;