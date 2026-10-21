import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRole] = useState("Student");

  useEffect(() => {
    let subscription = null;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProfile = await authService.getProfile(currentSession.user.id);
            setProfile(userProfile);
          }
        } catch (err) {
          console.warn("Supabase auth init error:", err.message);
        }

        // Listen to auth state transitions
        const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);
          if (newSession?.user) {
            const userProfile = await authService.getProfile(newSession.user.id);
            setProfile(userProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        subscription = data.subscription;
      } else {
        // Fallback demo user for local exploration when Supabase keys are not yet provided
        const storedDemo = localStorage.getItem("educonnect-demo-user");
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setDemoRole(parsed.profile.role || "Student");
          } catch {}
        }
      }
      setLoading(false);
    }

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName, role = "Student", educationLevel = "Undergraduate" }) => {
    setLoading(true);
    try {
      const res = await authService.signUp({ email, password, fullName, role, educationLevel });
      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        setProfile(res.profile || { full_name: fullName, role, education_level: educationLevel });
        setDemoRole(role);
        if (!isSupabaseConfigured) {
          localStorage.setItem("educonnect-demo-user", JSON.stringify({
            user: res.user,
            profile: { full_name: fullName, role, education_level: educationLevel }
          }));
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authService.signIn({ email, password });
      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        setProfile(res.profile || { full_name: email.split("@")[0], role: "Student" });
        if (res.profile?.role) setDemoRole(res.profile.role);
        if (!isSupabaseConfigured) {
          localStorage.setItem("educonnect-demo-user", JSON.stringify({
            user: res.user,
            profile: res.profile || { full_name: email.split("@")[0], role: "Student" }
          }));
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem("educonnect-demo-user");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (user?.id) {
      const updated = await authService.updateProfile(user.id, updates);
      setProfile(updated || { ...profile, ...updates });
      return updated;
    } else {
      const updated = { ...(profile || {}), ...updates };
      setProfile(updated);
      return updated;
    }
  };

  const setRole = (newRole) => {
    setDemoRole(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  // Quick sign in as demo user for instant hackathon walkthrough
  const quickDemoLogin = (targetRole = "Student") => {
    const mockUser = {
      id: "demo-user-" + targetRole.toLowerCase(),
      email: targetRole === "Faculty" ? "meera.rao@university.edu" : "aarav.shah@student.edu",
    };
    const mockProfile = {
      id: mockUser.id,
      full_name: targetRole === "Faculty" ? "Dr. Meera Rao" : "Aarav Shah",
      role: targetRole,
      education_level: targetRole === "Faculty" ? "Professor & PhD" : "Computer Science (3rd Year)",
      avatar_url: "",
    };
    setUser(mockUser);
    setProfile(mockProfile);
    setDemoRole(targetRole);
    localStorage.setItem("educonnect-demo-user", JSON.stringify({ user: mockUser, profile: mockProfile }));
  };

  const currentRole = profile?.role || demoRole || "Student";
  const displayName = profile?.full_name || (currentRole === "Faculty" ? "Dr. Meera Rao" : "Aarav Shah");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        role: currentRole,
        displayName,
        setRole,
        signUp,
        signIn,
        signOut,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

