import React, { useState } from "react";
import { X, Lock, Mail, User, GraduationCap, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthModal({ isOpen, onClose, initialMode = "login", onNotify }) {
  const { signIn, signUp, quickDemoLogin, isConfigured } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Student");
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn({ email, password });
        onNotify("Signed in successfully!");
        onClose();
      } else {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        await signUp({ email, password, fullName, role, educationLevel });
        onNotify("Account created successfully!");
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (targetRole) => {
    quickDemoLogin(targetRole);
    onNotify(`Logged in as demo ${targetRole}!`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ACADEMIC ACCESS</span>
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>

        {/* Supabase Status pill */}
        <div className={`auth-status-pill ${isConfigured ? "configured" : "demo"}`}>
          {isConfigured ? (
            <>
              <CheckCircle2 size={13} />
              <span>Connected to live Supabase Auth</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Offline Demo Mode Active (Add .env.local for Cloud Auth)</span>
            </>
          )}
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <>
              <label className="field-label">Full Name</label>
              <div className="auth-input-field">
                <User size={16} />
                <input
                  type="text"
                  placeholder="e.g. Aarav Shah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-row-fields">
                <div>
                  <label className="field-label">Academic Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Education Level</label>
                  <select
                    className="form-select"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Doctoral / PhD">Doctoral / PhD</option>
                    <option value="Faculty / Instructor">Faculty / Instructor</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <label className="field-label">Email Address</label>
          <div className="auth-input-field">
            <Mail size={16} />
            <input
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="field-label">Password</label>
          <div className="auth-input-field">
            <Lock size={16} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-button full-button" disabled={loading}>
            {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create Account"}
          </button>
        </form>

        <div className="auth-toggle-row">
          <span>{mode === "login" ? "Don't have an account?" : "Already registered?"}</span>
          <button
            className="text-button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>

        {/* Quick Demo Access for Hackathon Demonstrations */}
        <div className="demo-shortcuts">
          <div className="demo-shortcuts-label">
            <span>OR 1-CLICK DEMO ACCESS</span>
          </div>
          <div className="demo-shortcuts-btns">
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleDemoLogin("Student")}
            >
              <GraduationCap size={15} /> Student Demo View
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleDemoLogin("Faculty")}
            >
              <Sparkles size={15} /> Faculty Demo View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

