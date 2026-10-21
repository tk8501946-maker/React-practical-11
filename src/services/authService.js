import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const authService = {
  // Check current authenticated session
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }
    return data.session;
  },

  // Get current user profile
  async getProfile(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch profile:", error.message);
      return null;
    }
    return data;
  },

  // Sign up a new student or faculty member
  async signUp({ email, password, fullName, role = "Student", educationLevel = "Undergraduate" }) {
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback for demo without credentials
      return {
        user: { id: "demo-user-" + Date.now(), email },
        profile: { id: "demo-user-" + Date.now(), full_name: fullName, role, education_level: educationLevel },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          education_level: educationLevel,
        },
      },
    });

    if (error) throw error;

    // In case the trigger hasn't finished or manual profile is needed:
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: fullName,
          role,
          education_level: educationLevel,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      return { user: data.user, session: data.session, profile };
    }

    return { user: data.user, session: data.session, profile: null };
  },

  // Sign in existing user
  async signIn({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        user: { id: "demo-user", email },
        profile: { id: "demo-user", full_name: email.split("@")[0], role: "Student" },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let profile = null;
    if (data.user) {
      profile = await this.getProfile(data.user.id);
    }

    return { user: data.user, session: data.session, profile };
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error.message);
  },

  // Update profile
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !supabase || !userId) return updates;
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

