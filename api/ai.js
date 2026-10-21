// Vercel Serverless Function: /api/ai
// Compatible with Vercel deployment without requiring an always-on server.
// Private API keys are kept safely on the server side and never sent to the browser.

export default async function handler(req, res) {
  // Set CORS headers for Vercel preview environments
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { prompt, topic, mode = "explain" } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Please provide a valid question or concept prompt." });
    }

    const cleanPrompt = prompt.trim().slice(0, 1000); // Prevent oversized payloads
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

    // 1. If a live API key is configured in the serverless environment:
    if (apiKey) {
      try {
        const systemPrompt = `You are EduConnect AI, an expert academic tutor and university mentor.
Provide clear, structured, and pedagogically sound explanations.
Use headings, bullet points, and code/math examples where relevant.
Mode: ${mode}. Subject/Topic: ${topic || "General Academic"}.`;

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: cleanPrompt },
            ],
            temperature: 0.6,
            max_tokens: 800,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const answer = data.choices?.[0]?.message?.content;
          if (answer) {
            return res.status(200).json({
              answer,
              source: "Live AI Tutor (OpenAI)",
              live: true,
              mode,
            });
          }
        }
      } catch (liveErr) {
        console.error("Serverless live model error:", liveErr.message);
      }
    }

    // 2. Structured educational tutor engine when API key is not yet configured:
    const tutorResponse = generateEducationalResponse(cleanPrompt, mode, topic);
    return res.status(200).json({
      ...tutorResponse,
      live: false,
      note: apiKey
        ? "AI provider returned fallback response."
        : "Serverless AI integration ready. Add OPENAI_API_KEY in your Vercel Project Settings for live model generation.",
    });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({ error: "Internal server error processing AI request." });
  }
}

function generateEducationalResponse(prompt, mode, topic) {
  const p = prompt.toLowerCase();

  if (mode === "quiz") {
    return {
      answer: `Here is a 3-question conceptual practice quiz for: "${prompt}":\n\n1. Question 1: What is the primary invariant or principle governing this concept?\n   A) Linear scaling\n   B) Minimal dependency\n   C) Exhaustive recursion\n   *Self-check: Explain why option B minimizes coupling.*\n\n2. Question 2: In what scenario would this technique perform worst (edge-case)?\n   *Hint: Consider memory constraints and sorted input orders.*\n\n3. Question 3: How does this balance time complexity versus spatial overhead?\n\nTip: Try solving these in your notes, then ask EduConnect AI for the worked answers!`,
      source: "EduConnect AI Practice Engine",
    };
  }

  if (mode === "plan") {
    return {
      answer: `Recommended 3-Step Study Plan for: "${prompt}":\n\n- Phase 1 (Day 1 - Foundation): Focus on the core definition, notations, and 2 minimal worked examples. Spend 30 minutes.\n- Phase 2 (Day 2 - Edge Cases): Practice 3 varied exam problems and observe boundary conditions. Spend 45 minutes.\n- Phase 3 (Day 3 - Synthesis): Explain the topic aloud or post a doubt in the forum to verify your understanding.\n\nKeep consistency high and review your notes after 48 hours for spaced repetition!`,
      source: "EduConnect AI Study Planner",
    };
  }

  // Concept explanations:
  if (p.includes("normalization") || p.includes("dbms") || p.includes("sql") || p.includes("3nf")) {
    return {
      answer: `Relational Database Normalization Breakdown:\n\n1. Purpose: Eliminates insertion, deletion, and update anomalies while reducing redundant disk storage.\n2. 1NF (First Normal Form): All attributes must contain atomic (indivisible) values. No multi-valued sets or repeating groups.\n3. 2NF (Second Normal Form): Must be in 1NF and have NO partial dependency. Every non-prime attribute must depend on the whole candidate key (crucial for composite primary keys).\n4. 3NF (Third Normal Form): Must be in 2NF and have NO transitive dependencies (X -> Y and Y -> Z where Z is non-prime).\n\nPractical Rule of Thumb: In 3NF, "every non-key attribute must provide a fact about the key, the whole key, and nothing but the key."`,
      source: "Database Systems Knowledge Base",
    };
  }

  if (p.includes("complexity") || p.includes("big o") || p.includes("loop") || p.includes("time complexity")) {
    return {
      answer: `Asymptotic Complexity & Nested Loop Analysis:\n\n1. Independent Loops: If outer runs n times and inner runs m times independently, total time is O(n × m).\n2. Dependent Loops: If outer runs i = 1 to n and inner runs j = 1 to i, total iterations = 1 + 2 + ... + n = n(n + 1)/2 = O(n²).\n3. Halving Loops: If loop variable multiplies or divides by 2 each iteration (e.g., i = i / 2), the loop executes in O(log n) steps.\n\nKey Rule: Drop lower-order constants and coefficients. Always measure worst-case behavior unless average-case is explicitly requested.`,
      source: "Data Structures & Algorithms Knowledge Base",
    };
  }

  if (p.includes("supervised") || p.includes("unsupervised") || p.includes("machine learning") || p.includes("ai")) {
    return {
      answer: `Supervised vs. Unsupervised Learning Comparison:\n\n• Supervised Learning: Trained on labeled datasets (paired inputs X and ground-truth targets Y). The model learns a mapping function. Tasks include Classification (e.g., medical diagnostics) and Regression (e.g., price forecasting).\n• Unsupervised Learning: Trained on unlabeled datasets without predefined answers. The model discovers latent patterns, intrinsic structures, or clusters. Tasks include K-Means Clustering and Dimensionality Reduction (PCA).\n\nKey takeaway: Supervised evaluates against known answers; Unsupervised discovers inherent data topology.`,
      source: "Artificial Intelligence Knowledge Base",
    };
  }

  if (p.includes("react") || p.includes("component") || p.includes("hook") || p.includes("state")) {
    return {
      answer: `Modern React Architecture Principles:\n\n1. Declarative UI: React renders views based on current State and Props. When state changes, React recalculates the virtual DOM and updates only modified elements.\n2. State Management: Keep state close to where it is used. Use useState for local UI states, and Context or Supabase Realtime for global authentication/application sessions.\n3. Component Decomposition: Break UI into small, single-responsibility components with accessible keyboard and ARIA support.`,
      source: "Web Engineering Knowledge Base",
    };
  }

  return {
    answer: `Academic Explanation for: "${prompt}":\n\n1. Core Definition: Start by defining what problem this concept solves and why it was introduced.\n2. Key Mechanics: Examine the core rules, mathematical invariants, or operational steps.\n3. Practical Example: Apply it to a concrete, minimal test case.\n4. Common Pitfalls: Watch for edge conditions and common exam misconceptions.\n\nWould you like me to generate a 3-question practice quiz or create a revision schedule for this topic?`,
    source: "EduConnect AI Educational Engine",
  };
}

