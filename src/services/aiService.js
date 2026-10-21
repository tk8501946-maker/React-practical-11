import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const aiService = {
  async askTutor({ prompt, topic = "General", mode = "explain", userId = null }) {
    if (!prompt || !prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    let result = null;

    // Try calling the Vercel serverless function
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, topic, mode }),
      });

      if (response.ok) {
        result = await response.json();
      }
    } catch {
      // Local dev mode where Vite is running alone without Vercel serverless functions
      result = null;
    }

    // Fallback if /api/ai is not served locally
    if (!result || !result.answer) {
      result = generateLocalResponse(prompt, mode, topic);
    }

    // If Supabase is connected and user is logged in, save to ai_learning_history
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from("ai_learning_history").insert({
          user_id: userId,
          question: prompt,
          answer: result.answer,
          topic: topic || "General",
        });
      } catch (e) {
        console.warn("Could not save AI history to Supabase:", e.message);
      }
    }

    return result;
  },

  async getHistory(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from("ai_learning_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },
};

function generateLocalResponse(prompt, mode) {
  const p = prompt.toLowerCase();

  if (mode === "quiz") {
    return {
      answer: `Practice Quiz for: "${prompt}":\n\n1. Question 1: What core condition must hold true for this concept to be valid?\n   • Option A: Constant space overhead\n   • Option B: Structural consistency & minimal redundancy (Correct)\n   • Option C: Unbounded growth\n\n2. Question 2: In what practical scenario would this approach fail or cause high overhead?\n\n3. Question 3: How does this concept integrate into modern cloud and database software architectures?`,
      source: "EduConnect AI Practice Engine",
      live: false,
      note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
    };
  }

  if (mode === "plan") {
    return {
      answer: `3-Day Rapid Mastery Plan for: "${prompt}":\n\n• Day 1: Concept fundamentals, definitions, and 2 minimal worked examples (40 mins).\n• Day 2: Exam questions, boundary conditions, and performance tradeoffs (50 mins).\n• Day 3: Peer discussion in EduConnect Doubt Forum & self-test flashcards (30 mins).`,
      source: "EduConnect AI Study Planner",
      live: false,
      note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
    };
  }

  if (p.includes("normalization") || p.includes("dbms") || p.includes("sql") || p.includes("3nf")) {
    return {
      answer: `Relational Database Normalization Breakdown:\n\n1. Purpose: Eliminates insertion, deletion, and update anomalies while reducing redundant disk storage.\n2. 1NF (First Normal Form): All attributes must contain atomic (indivisible) values. No repeating groups or multivalued columns.\n3. 2NF (Second Normal Form): Must be in 1NF and have NO partial dependencies. Every non-prime attribute must depend on the whole primary key.\n4. 3NF (Third Normal Form): Must be in 2NF and have NO transitive dependencies (non-key attribute depending on another non-key attribute).\n\nPractical Summary: In 3NF, every non-key attribute must provide a fact about the key, the whole key, and nothing but the key.`,
      source: "Database Systems Knowledge Base",
      live: false,
      note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
    };
  }

  if (p.includes("complexity") || p.includes("big o") || p.includes("loop") || p.includes("time complexity")) {
    return {
      answer: `Asymptotic Complexity & Nested Loop Analysis:\n\n1. Independent Loops: If an outer loop runs n times and an inner loop runs m times independently, total time complexity is O(n × m).\n2. Dependent Loops: If outer loop runs i = 1 to n and inner loop runs j = 1 to i, total iterations = 1 + 2 + ... + n = n(n + 1)/2 = O(n²).\n3. Halving Loops: If a loop variable halves each iteration (i = i / 2), the loop executes in O(log n) steps.\n\nKey Rule: Drop lower-order constants and coefficients. Always measure worst-case behavior unless specified otherwise.`,
      source: "Data Structures & Algorithms Knowledge Base",
      live: false,
      note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
    };
  }

  if (p.includes("supervised") || p.includes("unsupervised") || p.includes("machine learning") || p.includes("ai")) {
    return {
      answer: `Supervised vs. Unsupervised Learning Comparison:\n\n• Supervised Learning: Trained on labeled datasets (paired inputs X and ground-truth targets Y). The model learns a predictive mapping. Examples: spam filters, medical image diagnosis, house price forecasting.\n• Unsupervised Learning: Trained on unlabeled data. The algorithm uncovers hidden patterns, intrinsic cluster topologies, or representations. Examples: customer segmentation, anomaly detection, K-means.\n\nTakeaway: Supervised evaluates against known answers; Unsupervised discovers inherent data patterns.`,
      source: "Artificial Intelligence Knowledge Base",
      live: false,
      note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
    };
  }

  return {
    answer: `Academic Explanation for: "${prompt}":\n\n1. Concept Fundamentals: Understanding the core goal and why this principle matters in academic coursework.\n2. Step-by-Step Breakdown: Identifying the required formulas, theorems, or data structures.\n3. Common Pitfalls: Watch out for boundary conditions and edge cases in exam questions.\n\nFeel free to ask for a practice quiz or study plan on this topic!`,
    source: "EduConnect AI Educational Engine",
    live: false,
    note: "Generated using built-in educational logic. For live LLM responses, deploy to Vercel with OPENAI_API_KEY.",
  };
}

