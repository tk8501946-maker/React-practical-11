import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const initialMockAssignments = [
  {
    id: "a1",
    title: "Database normalization worksheet",
    subject: "Database Systems",
    due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
    due_text: "Tomorrow, 11:59 PM",
    type: "Individual assignment",
    status: "Pending",
    tone: "purple",
    description: "Convert an unnormalized student course registration table to 3NF, identify all functional dependencies, and specify candidate keys.",
  },
  {
    id: "a2",
    title: "Sorting algorithms performance analysis",
    subject: "Data Structures",
    due_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    due_text: "15 Oct 2026",
    type: "Practical work",
    status: "Pending",
    tone: "blue",
    description: "Benchmark QuickSort, MergeSort, and HeapSort with randomized, sorted, and reverse-sorted integer arrays of size 10^5.",
  },
  {
    id: "a3",
    title: "AI use cases mini project proposal",
    subject: "Artificial Intelligence",
    due_date: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    due_text: "16 Oct 2026",
    type: "Project proposal",
    status: "Submitted",
    tone: "green",
    description: "Submit a 2-page research proposal detailing problem formulation, data pipeline, baseline models, and ethical considerations.",
  },
];

export const assignmentsService = {
  async getAssignments(userId) {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("educonnect-assignments");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return initialMockAssignments;
    }

    try {
      let query = supabase.from("assignments").select("*").order("due_date", { ascending: true });
      if (userId) {
        query = query.eq("student_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) return initialMockAssignments;

      return data.map((a) => ({
        ...a,
        due_text: formatDueDate(a.due_date),
      }));
    } catch (err) {
      console.warn("Error fetching assignments:", err.message);
      return initialMockAssignments;
    }
  },

  async markStatus(id, newStatus) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getAssignments();
      const updated = current.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      localStorage.setItem("educonnect-assignments", JSON.stringify(updated));
      return updated.find((a) => a.id === id);
    }

    const { data, error } = await supabase
      .from("assignments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { ...data, due_text: formatDueDate(data.due_date) };
  },

  async createAssignment({ title, subject, dueDate, description, type = "Individual assignment", userId, tone = "purple" }) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getAssignments();
      const newAssignment = {
        id: "a-" + Date.now(),
        title,
        subject,
        due_date: new Date(dueDate).toISOString(),
        due_text: formatDueDate(dueDate),
        type,
        status: "Pending",
        tone,
        description,
        student_id: userId || null,
      };
      const updated = [newAssignment, ...current];
      localStorage.setItem("educonnect-assignments", JSON.stringify(updated));
      return newAssignment;
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        title,
        subject,
        due_date: new Date(dueDate).toISOString(),
        description,
        type,
        status: "Pending",
        tone,
        student_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, due_text: formatDueDate(data.due_date) };
  },
};

function formatDueDate(isoString) {
  if (!isoString) return "TBD";
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
  if (diffDays === 0) return "Today, 11:59 PM";
  if (diffDays === 1) return "Tomorrow, 11:59 PM";
  if (diffDays < 0) return "Overdue";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

