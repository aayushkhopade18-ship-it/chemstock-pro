import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFlask,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaSpinner,
  FaArrowRight,
  FaAtom,
  FaMicroscope,
} from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebase";

export default function Login() {
  const navigate = useNavigate();
  const authContext = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your institutional email and password.");
      return;
    }

    try {
      setLoading(true);
      if (authContext && authContext.login) {
        await authContext.login(email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email address or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment.");
      } else {
        setError(err.message || "Failed to sign in. Please verify connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Ambient Radial Lights */}
      <div className="radial-glow glow-cyan" />
      <div className="radial-glow glow-blue" />
      <div className="radial-glow glow-purple" />

      {/* Main Centered Glass Deck */}
      <div className="glass-deck">
        
        {/* LEFT: 3D Atomic Orbital Chamber & Floating Badges */}
        <div className="visual-hero">
          <div className="brand-mark">
            <div className="brand-badge-icon">
              <FaFlask />
            </div>
            <div>
              <div className="brand-name">
                ChemStock <span className="neon-text">PRO</span>
              </div>
              <div className="brand-tagline">SMART LABORATORY ECOSYSTEM</div>
            </div>
          </div>

          {/* Central 3D Animated Atomic Core */}
          <div className="atom-stage">
            <div className="orbital-ring ring-1">
              <div className="orbital-particle particle-1" />
            </div>
            <div className="orbital-ring ring-2">
              <div className="orbital-particle particle-2" />
            </div>
            <div className="orbital-ring ring-3">
              <div className="orbital-particle particle-3" />
            </div>
            <div className="atom-core">
              <FaAtom className="core-icon" />
              <div className="core-pulse" />
            </div>

            {/* Floating Glass Badges */}
            <div className="float-badge badge-top-left">
              <div className="badge-glow-dot cyan" />
              <FaFlask className="badge-icon" />
              <div>
                <span className="badge-label">GHS MSDS</span>
                <span className="badge-val">Classified</span>
              </div>
            </div>

            <div className="float-badge badge-top-right">
              <div className="badge-glow-dot green" />
              <FaMicroscope className="badge-icon" />
              <div>
                <span className="badge-label">Equipment</span>
                <span className="badge-val">AMC Synced</span>
              </div>
            </div>

            <div className="float-badge badge-bottom">
              <div className="badge-glow-dot amber" />
              <FaShieldAlt className="badge-icon" />
              <div>
                <span className="badge-label">Database</span>
                <span className="badge-val">Multi-Tenant Vault</span>
              </div>
            </div>
          </div>

          <div className="dev-signature">
            <span className="dev-label">ENGINEERED BY</span>
            <span className="dev-name">AAYUSH KHOPADE</span>
          </div>
        </div>

        {/* RIGHT: Clean Authentication Terminal */}
        <div className="auth-terminal">
          <div className="terminal-header">
            <div className="status-pill">
              <span className="pulsing-led" />
              INSTITUTIONAL GATEWAY
            </div>
            <h2 className="terminal-title">Access Terminal</h2>
            <p className="terminal-desc">Enter your credentials to access the laboratory console</p>
          </div>

          {error && (
            <div className="alert-strip">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form" autoComplete="off">
            <div className="form-field">
              <label className="field-label">Institutional Email</label>
              <div className="field-control">
                <FaEnvelope className="field-adornment" />
                <input
                  type="email"
                  required
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Password</label>
              <div className="field-control">
                <FaLock className="field-adornment" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="visibility-btn"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-action-btn ${loading ? "is-loading" : ""}`}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner-icon" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <FaArrowRight style={{ marginLeft: "8px", fontSize: "12px" }} />
                </>
              )}
            </button>
          </form>

          <div className="terminal-footer">
            <FaShieldAlt style={{ color: "#38bdf8", marginRight: "6px" }} />
            256-Bit SSL Encrypted Campus Connection
          </div>
        </div>

      </div>

      {/* Scoped Clean Styles */}
      <style>{`
        .login-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #040914;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
          box-sizing: border-box;
        }

        .radial-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
        }
        .glow-cyan {
          width: 500px;
          height: 500px;
          background: rgba(14, 165, 233, 0.18);
          top: -140px;
          left: -80px;
        }
        .glow-blue {
          width: 600px;
          height: 600px;
          background: rgba(37, 99, 235, 0.16);
          bottom: -200px;
          right: -120px;
        }
        .glow-purple {
          width: 350px;
          height: 350px;
          background: rgba(139, 92, 246, 0.12);
          top: 35%;
          left: 48%;
        }

        /* Master Centered Glass Deck */
        .glass-deck {
          width: 100%;
          max-width: 940px;
          min-height: 530px;
          background: rgba(10, 20, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 24px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          box-shadow: 
            0 25px 60px -15px rgba(0, 0, 0, 0.75),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        /* Left Visual Hero */
        .visual-hero {
          padding: 38px;
          background: linear-gradient(135deg, rgba(14, 28, 60, 0.5) 0%, rgba(6, 13, 30, 0.85) 100%);
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 3;
        }
        .brand-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.35);
        }
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #f8fafc;
        }
        .neon-text {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-tagline {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #64748b;
          margin-top: 2px;
        }

        /* 3D Atomic Orbital Stage */
        .atom-stage {
          position: relative;
          width: 100%;
          height: 270px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px 0;
        }

        .orbital-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(56, 189, 248, 0.25);
          pointer-events: none;
        }
        .ring-1 {
          width: 210px;
          height: 210px;
          transform: rotateX(65deg) rotateY(20deg);
          animation: spinOrbital 10s linear infinite;
        }
        .ring-2 {
          width: 190px;
          height: 190px;
          transform: rotateX(65deg) rotateY(-35deg);
          animation: spinOrbitalRev 12s linear infinite;
          border-color: rgba(99, 102, 241, 0.3);
        }
        .ring-3 {
          width: 230px;
          height: 230px;
          transform: rotateX(25deg) rotateY(65deg);
          animation: spinOrbital 14s linear infinite;
          border-color: rgba(56, 189, 248, 0.2);
        }

        .orbital-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 12px #38bdf8;
          top: -4px;
          left: 50%;
        }
        .particle-2 {
          background: #818cf8;
          box-shadow: 0 0 12px #818cf8;
        }
        .particle-3 {
          background: #34d399;
          box-shadow: 0 0 12px #34d399;
        }

        @keyframes spinOrbital {
          from { transform: rotateX(65deg) rotateY(20deg) rotateZ(0deg); }
          to { transform: rotateX(65deg) rotateY(20deg) rotateZ(360deg); }
        }
        @keyframes spinOrbitalRev {
          from { transform: rotateX(65deg) rotateY(-35deg) rotateZ(360deg); }
          to { transform: rotateX(65deg) rotateY(-35deg) rotateZ(0deg); }
        }

        .atom-core {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(2, 6, 23, 0.85) 75%);
          border: 1px solid rgba(56, 189, 248, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 0 35px rgba(14, 165, 233, 0.45);
        }
        .core-icon {
          font-size: 30px;
          color: #38bdf8;
          animation: spinSlow 15s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .core-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(56, 189, 248, 0.4);
          animation: corePulse 2.5s ease-out infinite;
        }
        @keyframes corePulse {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* Floating Hologram Badges */
        .float-badge {
          position: absolute;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 7px 11px;
          display: flex;
          align-items: center;
          gap: 9px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
          z-index: 4;
        }
        .badge-icon {
          font-size: 13px;
          color: #38bdf8;
        }
        .badge-glow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .badge-glow-dot.cyan { background: #38bdf8; box-shadow: 0 0 8px #38bdf8; }
        .badge-glow-dot.green { background: #34d399; box-shadow: 0 0 8px #34d399; }
        .badge-glow-dot.amber { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
        .badge-label {
          display: block;
          font-size: 8.5px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
        }
        .badge-val {
          font-size: 10.5px;
          font-weight: 700;
          color: #f1f5f9;
        }

        .badge-top-left {
          top: 15px;
          left: 10px;
          animation: floatA 4s ease-in-out infinite;
        }
        .badge-top-right {
          top: 25px;
          right: 10px;
          animation: floatB 4.5s ease-in-out infinite;
        }
        .badge-bottom {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: floatA 5s ease-in-out infinite;
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(7px); }
        }

        .dev-signature {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          z-index: 3;
        }
        .dev-label {
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #475569;
          font-weight: 800;
        }
        .dev-name {
          font-size: 11px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.5px;
        }

        /* Right Form Terminal */
        .auth-terminal {
          padding: 40px 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(8, 16, 34, 0.45);
        }

        .terminal-header {
          margin-bottom: 22px;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .pulsing-led {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
          animation: ledBlink 2s ease-in-out infinite;
        }
        @keyframes ledBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .terminal-title {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .terminal-desc {
          margin: 6px 0 0;
          font-size: 13px;
          color: #94a3b8;
        }

        .alert-strip {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 18px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .field-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .field-control {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-adornment {
          position: absolute;
          left: 14px;
          color: #475569;
          font-size: 14px;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          padding: 12px 38px 12px 42px;
          background: rgba(2, 6, 23, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 12px;
          color: #ffffff;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .field-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
          background: rgba(2, 6, 23, 0.85);
        }
        .visibility-btn {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .visibility-btn:hover {
          color: #cbd5e1;
        }

        .login-action-btn {
          margin-top: 6px;
          padding: 13px 20px;
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
          transition: all 0.2s ease;
        }
        .login-action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.45);
        }
        .is-loading {
          opacity: 0.75;
          cursor: not-allowed;
        }
        .spinner-icon {
          animation: spinSlow 1s linear infinite;
          margin-right: 8px;
        }

        .terminal-footer {
          margin-top: 22px;
          font-size: 11px;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive Breakpoint */
        @media (max-width: 840px) {
          .glass-deck {
            grid-template-columns: 1fr;
            max-width: 440px;
          }
          .visual-hero {
            display: none;
          }
          .auth-terminal {
            padding: 34px 24px;
          }
        }
      `}</style>
    </div>
  );
}