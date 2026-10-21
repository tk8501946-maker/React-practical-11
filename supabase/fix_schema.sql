-- ====================================================================
-- EduConnect AI — Secure, Idempotent Database Migration
-- File: supabase/fix_schema.sql
--
-- This script safely fixes security vulnerabilities, handles duplicate
-- policies, prevents privilege escalation, and ensures reply count
-- integrity without deleting existing tables or dropping data.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. ENSURE ALL 8 TABLES EXIST
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  education_level TEXT DEFAULT 'Undergraduate',
  role TEXT DEFAULT 'Student' CHECK (role IN ('Student', 'Faculty', 'Admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  image_url TEXT,
  syllabus TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  subject TEXT NOT NULL,
  author_name TEXT NOT NULL,
  replies_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Faculty answered', 'Resolved')),
  verified BOOLEAN DEFAULT false,
  tag TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doubt_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  response TEXT NOT NULL,
  is_faculty BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Graded')),
  type TEXT DEFAULT 'Individual assignment',
  tone TEXT DEFAULT 'purple',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  meeting_schedule TEXT,
  member_count INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. PERFORMANCE INDEXES (Idempotent)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_doubts_student ON public.doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON public.doubts(subject);
CREATE INDEX IF NOT EXISTS idx_doubt_replies_doubt ON public.doubt_replies(doubt_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user ON public.ai_learning_history(user_id);

-- ====================================================================
-- 4. SECURITY FIX 1: PREVENT PRIVILEGE ESCALATION ON PROFILES
-- ====================================================================

-- Function to safely create profile on signup without trusting self-assigned role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, education_level, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'education_level', 'Undergraduate'),
    -- Standard users default to 'Student' unless created by backend admin process
    'Student'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    education_level = EXCLUDED.education_level,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent regular users from changing their own role to Faculty or Admin
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow if current caller has Admin role in profiles or service_role
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    ) THEN
      -- Revert role change attempt
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ====================================================================
-- 5. SECURITY FIX 2: PREVENT FACULTY IMPERSONATION ON DOUBTS & REPLIES
-- ====================================================================

-- Trigger to ensure is_faculty can ONLY be set to TRUE by an actual verified Faculty member
CREATE OR REPLACE FUNCTION public.enforce_faculty_reply_badge()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_faculty IS TRUE THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Faculty'
    ) THEN
      NEW.is_faculty := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_faculty_reply_badge ON public.doubt_replies;
CREATE TRIGGER trg_enforce_faculty_reply_badge
  BEFORE INSERT OR UPDATE ON public.doubt_replies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_faculty_reply_badge();

-- Trigger to ensure students cannot verify their own doubts as 'Faculty answered'
CREATE OR REPLACE FUNCTION public.enforce_doubt_verification_guard()
RETURNS trigger AS $$
BEGIN
  IF (NEW.verified IS DISTINCT FROM OLD.verified OR NEW.status IS DISTINCT FROM OLD.status) THEN
    -- If non-faculty attempts to mark verified or 'Faculty answered', reject or revert
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Faculty'
    ) THEN
      NEW.verified := OLD.verified;
      IF NEW.status = 'Faculty answered' THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_doubt_verification_guard ON public.doubts;
CREATE TRIGGER trg_enforce_doubt_verification_guard
  BEFORE UPDATE ON public.doubts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_doubt_verification_guard();

-- ====================================================================
-- 6. SECURITY FIX 3: RECALCULATE DOUBT COUNTS & STATUS ACCURATELY
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_doubt_reply_count()
RETURNS trigger AS $$
DECLARE
  target_doubt_id UUID;
  has_faculty_reply BOOLEAN;
  current_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_doubt_id := OLD.doubt_id;
  ELSE
    target_doubt_id := NEW.doubt_id;
  END IF;

  -- Compute actual reply count
  SELECT COUNT(*) INTO current_count
  FROM public.doubt_replies
  WHERE doubt_id = target_doubt_id;

  -- Check if any verified faculty reply exists for this doubt
  SELECT EXISTS (
    SELECT 1 FROM public.doubt_replies
    WHERE doubt_id = target_doubt_id AND is_faculty = true
  ) INTO has_faculty_reply;

  -- Update parent doubt
  UPDATE public.doubts
  SET replies_count = current_count,
      verified = has_faculty_reply,
      status = CASE
        WHEN has_faculty_reply THEN 'Faculty answered'
        WHEN current_count > 0 THEN 'Open'
        ELSE 'Open'
      END,
      updated_at = now()
  WHERE id = target_doubt_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_doubt_reply_change ON public.doubt_replies;
CREATE TRIGGER on_doubt_reply_change
  AFTER INSERT OR UPDATE OR DELETE ON public.doubt_replies
  FOR EACH ROW EXECUTE FUNCTION public.handle_doubt_reply_count();

-- ====================================================================
-- 7. SECURITY FIX 4: PROTECT ASSIGNMENT INTEGRITY
-- ====================================================================

CREATE OR REPLACE FUNCTION public.enforce_assignment_integrity()
RETURNS trigger AS $$
BEGIN
  -- Prevent student from changing student_id ownership of an assignment
  IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN
    RAISE EXCEPTION 'Unauthorized: Assignment owner student_id cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_assignment_integrity ON public.assignments;
CREATE TRIGGER trg_enforce_assignment_integrity
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_assignment_integrity();

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES — IDEMPOTENT (SAFE RE-RUN)
-- ====================================================================

-- Enable RLS on all 8 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_history ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 8.2 COURSES POLICIES
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (true);

-- 8.3 ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
CREATE POLICY "Students can view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can enroll in courses" ON public.enrollments;
CREATE POLICY "Students can enroll in courses"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their enrollment progress" ON public.enrollments;
CREATE POLICY "Students can update their enrollment progress"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can unenroll from courses" ON public.enrollments;
CREATE POLICY "Students can unenroll from courses"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- 8.4 DOUBTS POLICIES
DROP POLICY IF EXISTS "Doubts are readable by everyone" ON public.doubts;
DROP POLICY IF EXISTS "Doubts are readable by authenticated users" ON public.doubts;
CREATE POLICY "Doubts are readable by everyone"
  ON public.doubts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can post doubts" ON public.doubts;
CREATE POLICY "Authenticated users can post doubts"
  ON public.doubts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Doubts can be updated by author or faculty" ON public.doubts;
CREATE POLICY "Doubts can be updated by author or faculty"
  ON public.doubts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Faculty')
  );

DROP POLICY IF EXISTS "Authors can delete their doubts" ON public.doubts;
CREATE POLICY "Authors can delete their doubts"
  ON public.doubts FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- 8.5 DOUBT REPLIES POLICIES
DROP POLICY IF EXISTS "Replies are readable by everyone" ON public.doubt_replies;
DROP POLICY IF EXISTS "Replies are readable by authenticated users" ON public.doubt_replies;
CREATE POLICY "Replies are readable by everyone"
  ON public.doubt_replies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can post replies" ON public.doubt_replies;
CREATE POLICY "Authenticated users can post replies"
  ON public.doubt_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      is_faculty IS FALSE OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Faculty')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own replies" ON public.doubt_replies;
CREATE POLICY "Users can delete their own replies"
  ON public.doubt_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8.6 ASSIGNMENTS POLICIES
DROP POLICY IF EXISTS "Students can view their own assignments" ON public.assignments;
CREATE POLICY "Students can view their own assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Faculty')
  );

DROP POLICY IF EXISTS "Students can create assignments" ON public.assignments;
CREATE POLICY "Students can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their own assignments" ON public.assignments;
CREATE POLICY "Students can update their own assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete their own assignments" ON public.assignments;
CREATE POLICY "Students can delete their own assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- 8.7 STUDY GROUPS POLICIES
DROP POLICY IF EXISTS "Study groups are readable by everyone" ON public.study_groups;
DROP POLICY IF EXISTS "Study groups are readable by authenticated users" ON public.study_groups;
CREATE POLICY "Study groups are readable by everyone"
  ON public.study_groups FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create study groups" ON public.study_groups;
CREATE POLICY "Authenticated users can create study groups"
  ON public.study_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 8.8 AI LEARNING HISTORY POLICIES
DROP POLICY IF EXISTS "Users can view only their own AI history" ON public.ai_learning_history;
CREATE POLICY "Users can view only their own AI history"
  ON public.ai_learning_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI history" ON public.ai_learning_history;
CREATE POLICY "Users can insert their own AI history"
  ON public.ai_learning_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own AI history" ON public.ai_learning_history;
CREATE POLICY "Users can delete their own AI history"
  ON public.ai_learning_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ====================================================================
-- 9. SAFE SEED DATA (Idempotent: ON CONFLICT DO NOTHING)
-- ====================================================================

INSERT INTO public.courses (title, description, category, instructor_name, image_url, syllabus)
VALUES
  ('Database Systems & SQL Mastery', 'Comprehensive relational database design, normalization up to BCNF, indexing strategies, and query optimization.', 'Computer Science', 'Dr. Meera Rao', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600', ARRAY['Relational Algebra', '1NF, 2NF, 3NF Normalization', 'Indexing & B-Trees', 'ACID Transactions']),
  ('Data Structures & Algorithms', 'Core computer science fundamentals: complexity analysis, trees, graphs, sorting, and dynamic programming.', 'Computer Science', 'Prof. Rajesh Sharma', 'https://images.unsplash.com/photo-1516116211227-bbc13c9a2967?w=600', ARRAY['Asymptotic Notation', 'Linked Lists & Stacks', 'Binary Search Trees', 'Graph Traversals']),
  ('Artificial Intelligence & Machine Learning', 'Foundational concepts in supervised, unsupervised learning, neural network architectures, and evaluation metrics.', 'Artificial Intelligence', 'Dr. Anand Verma', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600', ARRAY['Search Algorithms', 'Linear & Logistic Regression', 'Neural Networks', 'Model Evaluation']),
  ('Modern Full-Stack Web Engineering', 'Building cloud-ready web applications with React, modern component design, REST/GraphQL APIs, and serverless architecture.', 'Software Engineering', 'Prof. Sunita Pillai', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', ARRAY['Component Architecture', 'State Management', 'REST & GraphQL APIs', 'Deployment & CI/CD'])
ON CONFLICT DO NOTHING;

INSERT INTO public.study_groups (name, subject, description, meeting_schedule, member_count)
VALUES
  ('Algorithms Sprint Squad', 'Data Structures', 'Daily problem solving on LeetCode/Codeforces and weekly mock interviews.', 'Mon, Wed, Fri at 6:00 PM', 8),
  ('DBMS & Backend Builders', 'Database Systems', 'Deep-dive into database normalization, query profiling, and schema tuning.', 'Tuesdays & Thursdays at 5:30 PM', 12),
  ('AI Paper Reading & Projects', 'Artificial Intelligence', 'Reviewing recent AI breakthroughs, prompting techniques, and model deployment.', 'Saturdays at 11:00 AM', 15)
ON CONFLICT DO NOTHING;

INSERT INTO public.doubts (id, title, question, subject, author_name, replies_count, status, verified, tag)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Can someone explain normalization in DBMS with an example?', 'I understand 1NF, but I am confused about when to use 2NF versus 3NF in database schemas.', 'Database Systems', 'Aarav Patel', 1, 'Faculty answered', true, 'Conceptual'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'How do we calculate time complexity for nested loops?', 'Could someone walk through an example where the inner loop depends on the outer loop, like for i=1..n and j=1..i?', 'Data Structures', 'Priya Shah', 0, 'Open', false, 'Exam prep'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Difference between supervised and unsupervised learning?', 'Looking for a simple comparison and one real-world production example of each.', 'Artificial Intelligence', 'Kabir Mehta', 1, 'Faculty answered', true, 'AI / ML')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doubt_replies (id, doubt_id, author_name, response, is_faculty)
VALUES
  ('44444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Dr. Meera Rao', '2NF removes partial functional dependencies (where a non-key attribute depends on only part of a composite primary key). 3NF removes transitive dependencies (where a non-key attribute depends on another non-key attribute). A classic rule: every non-key attribute must provide a fact about the key, the whole key, and nothing but the key.', true)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 10. POST-MIGRATION VERIFICATION QUERIES
-- Run these queries after executing the script to verify table health:
-- ====================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';
-- SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

