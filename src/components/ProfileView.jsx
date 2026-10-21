import React, { useState } from "react";
import {
  User, Mail, GraduationCap, ShieldCheck, Database, LogOut,
  Save, CheckCircle2, Sparkles, Key
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ProfileView({ notify, onOpenAuth }) {
  const { user, profile, role, displayName, setRole, updateProfile, signOut, isConfigured } = useAuth();
  const [fullName, setFullName] = useState(displayName);
  const [educationLevel, setEducationLevel] = useState(profile?.education_level || "Undergraduate (3rd Year)");
  const [selectedRole, setSelectedRole] = useState(role);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        education_level: educationLevel,
        role: selectedRole,
      });
      setRole(selectedRole);
      notify("Profile details updated successfully!");
    } catch {
      notify("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    notify("Signed out successfully.");
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <div className="eyebrow">STUDENT ACCOUNT</div>
          <h1>Profile & Academic Settings</h1>
          <p>Manage your student identity, adjust academic preferences, and inspect database connectivity.</p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Profile Card */}
        <div className="panel profile-form-card">
          <div className="profile-header-banner">
            <div className="profile-avatar-large">
              {fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h2>{fullName}</h2>
              <span className="profile-role-badge">
                <GraduationCap size={13} /> {selectedRole} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="profile-edit-form">
            <label className="field-label">Full Name</label>
            <input
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label className="field-label">Email Address</label>
            <input
              className="form-input"
              value={user?.email || "aarav.shah@student.edu"}
              disabled
              title="Email is managed through authentication service"
            />

            <div className="profile-form-row">
              <div>
                <label className="field-label">Academic Role</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="field-label">Academic Standing / Level</label>
                <input
                  className="form-input"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                />
              </div>
            </div>

            <div className="profile-actions-row">
              <button type="submit" className="primary-button" disabled={saving}>
                <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
              </button>
              {user ? (
                <button type="button" className="secondary-button" onClick={handleLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <button type="button" className="secondary-button" onClick={() => onOpenAuth("login")}>
                  Sign in to real account
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Backend & Environment Health Card */}
        <div className="panel profile-status-card">
          <div className="panel-heading">
            <div>
              <h3>Database & Auth Status</h3>
              <p>Managed Supabase integration status</p>
            </div>
            <span className={`status-pill ${isConfigured ? "status-done" : "status-pending"}`}>
              <i /> {isConfigured ? "Connected" : "Demo Mode"}
            </span>
          </div>

          <div className="backend-info-body">
            <div className="backend-item">
              <Database size={16} />
              <div>
                <strong>PostgreSQL Backend</strong>
                <p>{isConfigured ? "Live Supabase Cloud Instance" : "Local Browser Storage Fallback"}</p>
              </div>
            </div>

            <div className="backend-item">
              <ShieldCheck size={16} />
              <div>
                <strong>Row Level Security (RLS)</strong>
                <p>Enforced across profiles, enrollments, doubts, and assignments.</p>
              </div>
            </div>

            <div className="backend-item">
              <Sparkles size={16} />
              <div>
                <strong>Serverless AI Bridge</strong>
                <p>Vercel serverless /api/ai function ready for OpenAI API key.</p>
              </div>
            </div>

            <div className="env-tip-box">
              <Key size={14} />
              <div>
                <strong>How to connect live Supabase Cloud:</strong>
                <p>Create a <code>.env.local</code> in the project root containing your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then reload.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

