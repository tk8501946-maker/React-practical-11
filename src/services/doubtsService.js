import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const initialMockDoubts = [
  {
    id: "d1",
    title: "Can someone explain normalization in DBMS with an example?",
    subject: "Database Systems",
    author_name: "Aarav Patel",
    time: "12 min ago",
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    replies_count: 1,
    status: "Faculty answered",
    verified: true,
    tag: "Conceptual",
    question: "I understand 1NF, but I am confused about when to use 2NF versus 3NF. Can someone give a relatable real-world schema?",
    responses: [
      {
        id: "r1",
        author_name: "Dr. Meera Rao",
        is_faculty: true,
        response: "Think of 2NF as ensuring all non-key attributes depend on the WHOLE primary key (relevant for composite keys). 3NF goes further: no non-key attribute can depend on another non-key attribute (transitive dependency). For example, Student(ID, Department, DeptHead) violates 3NF because DeptHead depends on Department.",
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "d2",
    title: "How do we calculate time complexity for nested loops?",
    subject: "Data Structures",
    author_name: "Priya Shah",
    time: "35 min ago",
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    replies_count: 0,
    status: "Open",
    verified: false,
    tag: "Exam prep",
    question: "Could someone walk through an example where the inner loop depends on the outer loop, like for i=1..n and j=1..i?",
    responses: [],
  },
  {
    id: "d3",
    title: "Difference between supervised and unsupervised learning?",
    subject: "Artificial Intelligence",
    author_name: "Kabir Mehta",
    time: "1 hour ago",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    replies_count: 1,
    status: "Faculty answered",
    verified: true,
    tag: "AI / ML",
    question: "Looking for a simple comparison and one real-world example of each in production systems.",
    responses: [
      {
        id: "r2",
        author_name: "Dr. Meera Rao",
        is_faculty: true,
        response: "Supervised learning has ground-truth labels (input X, output Y). Example: Spam classification. Unsupervised learning has no labels; the algorithm uncovers underlying cluster structures or embeddings. Example: Customer market segmentation.",
        created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const doubtsService = {
  async getDoubts() {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("educonnect-doubts");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return initialMockDoubts;
    }

    try {
      const { data: doubts, error } = await supabase
        .from("doubts")
        .select(`
          *,
          responses:doubt_replies(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!doubts || doubts.length === 0) return initialMockDoubts;

      return doubts.map((d) => ({
        ...d,
        replies_count: d.responses ? d.responses.length : (d.replies_count || 0),
        time: formatRelativeTime(d.created_at),
      }));
    } catch (err) {
      console.warn("Error fetching doubts from Supabase:", err.message);
      return initialMockDoubts;
    }
  },

  async createDoubt({ title, question, subject, authorName, userId, tag = "General" }) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getDoubts();
      const newDoubt = {
        id: "d-" + Date.now(),
        title,
        question,
        subject,
        author_name: authorName || "Student",
        student_id: userId || null,
        time: "Just now",
        created_at: new Date().toISOString(),
        replies_count: 0,
        status: "Open",
        verified: false,
        tag,
        responses: [],
      };
      const updated = [newDoubt, ...current];
      localStorage.setItem("educonnect-doubts", JSON.stringify(updated));
      return newDoubt;
    }

    const { data, error } = await supabase
      .from("doubts")
      .insert({
        title,
        question,
        subject,
        author_name: authorName || "Student",
        student_id: userId || null,
        tag,
        status: "Open",
        verified: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, responses: [], time: "Just now" };
  },

  async addReply({ doubtId, response, authorName, userId, isFaculty = false }) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getDoubts();
      const newReply = {
        id: "r-" + Date.now(),
        doubt_id: doubtId,
        author_name: authorName || (isFaculty ? "Faculty Team" : "Student"),
        response,
        is_faculty: isFaculty,
        created_at: new Date().toISOString(),
      };
      const updated = current.map((d) => {
        if (d.id === doubtId) {
          const resps = [...(d.responses || []), newReply];
          return {
            ...d,
            responses: resps,
            replies_count: resps.length,
            status: isFaculty ? "Faculty answered" : d.status,
            verified: isFaculty ? true : d.verified,
          };
        }
        return d;
      });
      localStorage.setItem("educonnect-doubts", JSON.stringify(updated));
      return newReply;
    }

    const { data, error } = await supabase
      .from("doubt_replies")
      .insert({
        doubt_id: doubtId,
        user_id: userId || null,
        author_name: authorName || (isFaculty ? "Faculty Team" : "Student"),
        response,
        is_faculty: isFaculty,
      })
      .select()
      .single();

    if (error) throw error;

    // Update parent doubt status if faculty
    if (isFaculty) {
      await supabase
        .from("doubts")
        .update({
          status: "Faculty answered",
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", doubtId);
    }

    return data;
  },
};

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

