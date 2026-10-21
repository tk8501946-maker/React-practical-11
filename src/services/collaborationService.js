import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const initialStudyGroups = [
  {
    id: "g1",
    name: "Algorithms Sprint Squad",
    subject: "Data Structures",
    description: "Daily problem solving on LeetCode/Codeforces and weekly mock interviews.",
    meeting_schedule: "Mon, Wed, Fri at 6:00 PM",
    member_count: 8,
    is_member: true,
  },
  {
    id: "g2",
    name: "DBMS & Backend Builders",
    subject: "Database Systems",
    description: "Deep-dive into database normalization, query profiling, indexing, and schema tuning.",
    meeting_schedule: "Tuesdays & Thursdays at 5:30 PM",
    member_count: 12,
    is_member: false,
  },
  {
    id: "g3",
    name: "AI Paper Reading & Projects",
    subject: "Artificial Intelligence",
    description: "Reviewing recent AI breakthroughs, prompting techniques, and model deployment.",
    meeting_schedule: "Saturdays at 11:00 AM",
    member_count: 15,
    is_member: false,
  },
  {
    id: "g4",
    name: "Full-Stack Dev Circle",
    subject: "Software Engineering",
    description: "Pair programming, React best practices, and building hackathon-ready apps.",
    meeting_schedule: "Sundays at 4:00 PM",
    member_count: 6,
    is_member: true,
  },
];

export const collaborationService = {
  async getStudyGroups() {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("educonnect-groups");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return initialStudyGroups;
    }

    try {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return initialStudyGroups;

      return data.map((g) => ({
        ...g,
        is_member: false,
      }));
    } catch (err) {
      console.warn("Error fetching study groups:", err.message);
      return initialStudyGroups;
    }
  },

  async createGroup({ name, subject, description, meetingSchedule, userId }) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getStudyGroups();
      const newGroup = {
        id: "g-" + Date.now(),
        name,
        subject,
        description,
        meeting_schedule: meetingSchedule,
        member_count: 1,
        is_member: true,
      };
      const updated = [newGroup, ...current];
      localStorage.setItem("educonnect-groups", JSON.stringify(updated));
      return newGroup;
    }

    const { data, error } = await supabase
      .from("study_groups")
      .insert({
        name,
        subject,
        description,
        meeting_schedule: meetingSchedule,
        created_by: userId || null,
        member_count: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, is_member: true };
  },

  async toggleMembership(groupId) {
    const current = await this.getStudyGroups();
    const updated = current.map((g) => {
      if (g.id === groupId) {
        const nextIsMember = !g.is_member;
        return {
          ...g,
          is_member: nextIsMember,
          member_count: nextIsMember ? g.member_count + 1 : Math.max(1, g.member_count - 1),
        };
      }
      return g;
    });
    localStorage.setItem("educonnect-groups", JSON.stringify(updated));
    return updated.find((g) => g.id === groupId);
  },
};

