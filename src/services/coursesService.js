import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const initialMockCourses = [
  {
    id: "c1",
    title: "Database Systems & SQL Mastery",
    description: "Comprehensive relational database design, normalization up to BCNF, indexing strategies, and query optimization.",
    category: "Database Systems",
    instructor_name: "Dr. Meera Rao",
    image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600",
    syllabus: ["Relational Algebra", "1NF, 2NF, 3NF Normalization", "Indexing & B-Trees", "ACID Transactions"],
    enrolled: true,
    progress: 75,
  },
  {
    id: "c2",
    title: "Data Structures & Algorithms",
    description: "Core computer science fundamentals: complexity analysis, trees, graphs, sorting, and dynamic programming.",
    category: "Data Structures",
    instructor_name: "Prof. Rajesh Sharma",
    image_url: "https://images.unsplash.com/photo-1516116211227-bbc13c9a2967?w=600",
    syllabus: ["Asymptotic Notation", "Linked Lists & Stacks", "Binary Search Trees", "Graph Traversals"],
    enrolled: true,
    progress: 54,
  },
  {
    id: "c3",
    title: "Artificial Intelligence & Machine Learning",
    description: "Foundational concepts in supervised, unsupervised learning, neural network architectures, and evaluation metrics.",
    category: "Artificial Intelligence",
    instructor_name: "Dr. Anand Verma",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600",
    syllabus: ["Search Algorithms", "Linear & Logistic Regression", "Neural Networks", "Model Evaluation"],
    enrolled: true,
    progress: 81,
  },
  {
    id: "c4",
    title: "Modern Full-Stack Web Engineering",
    description: "Building cloud-ready web applications with React, modern component design, REST/GraphQL APIs, and serverless architecture.",
    category: "Software Engineering",
    instructor_name: "Prof. Sunita Pillai",
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    syllabus: ["Component Architecture", "State Management", "REST & GraphQL APIs", "Deployment & CI/CD"],
    enrolled: false,
    progress: 0,
  },
];

export const coursesService = {
  async getCourses(userId) {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem("educonnect-courses");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return initialMockCourses;
    }

    try {
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (coursesError) throw coursesError;

      // If database has no courses yet, return fallback mock courses
      if (!courses || courses.length === 0) {
        return initialMockCourses;
      }

      // Check student enrollments if user is authenticated
      if (userId) {
        const { data: enrollments, error: enrollError } = await supabase
          .from("enrollments")
          .select("course_id, progress")
          .eq("student_id", userId);

        if (!enrollError && enrollments) {
          const enrollMap = new Map(enrollments.map((e) => [e.course_id, e.progress]));
          return courses.map((course) => ({
            ...course,
            enrolled: enrollMap.has(course.id),
            progress: enrollMap.get(course.id) || 0,
          }));
        }
      }

      return courses.map((course) => ({ ...course, enrolled: false, progress: 0 }));
    } catch (err) {
      console.warn("Falling back to local courses:", err.message);
      return initialMockCourses;
    }
  },

  async enrollCourse(userId, courseId) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getCourses();
      const updated = current.map((c) => (c.id === courseId ? { ...c, enrolled: true, progress: 10 } : c));
      localStorage.setItem("educonnect-courses", JSON.stringify(updated));
      return { success: true };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .upsert(
        { student_id: userId, course_id: courseId, progress: 10, enrolled_at: new Date().toISOString() },
        { onConflict: "student_id,course_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(userId, courseId, progress) {
    if (!isSupabaseConfigured || !supabase) {
      const current = await this.getCourses();
      const updated = current.map((c) => (c.id === courseId ? { ...c, progress } : c));
      localStorage.setItem("educonnect-courses", JSON.stringify(updated));
      return { success: true };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .update({ progress })
      .eq("student_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

