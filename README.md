# EduConnect AI — Academic Collaboration & Learning Platform

EduConnect AI is a full-stack, student-focused academic collaboration and learning platform. Built for university communities, it bridges the gap between students, faculty mentors, and AI-assisted learning. Students can resolve academic doubts with official faculty verification, discover courses, manage coursework assignments, collaborate in peer study groups, and receive 24/7 conceptual explanations and practice quizzes powered by serverless AI.

---

## 1. Project Overview & Key Features

### 🎓 1. Verified Doubt Forum
- Students can ask questions tagged by curriculum subject (`Database Systems`, `Data Structures`, `Artificial Intelligence`, etc.).
- Peers can provide step-by-step explanations.
- Faculty members can post authoritative answers marked with an official **Verified Answer** shield.
- Instant search and status filtering (`All`, `Unanswered`, `Verified`).

### 🤖 2. 24/7 AI Academic Assistant
- **Concept Explainer Mode:** Generates intuitive analogies, mathematical breakdowns, and database schema examples.
- **Practice Quiz Generator Mode:** Creates conceptual 3-question self-tests on demand.
- **Study Sprint Planner Mode:** Generates a 3-day spaced repetition revision schedule.
- One-click action to transfer any AI explanation directly into the Doubt Forum for community discussion.
- Built-in **serverless API (`/api/ai`)** for Vercel deployment, keeping private AI credentials safely on the server side.

### 📚 3. Course Catalog & Enrollment
- Discover semester courses with syllabus modules and instructor profiles.
- One-click enrollment with progress tracking.
- Interactive course detail modal displaying weekly topics and core competencies.

### 📋 4. Coursework & Assignment Tracker
- Filter coursework by status: `Pending` vs. `Submitted`.
- Dynamic completion rate calculation.
- Modal to create new student or faculty assignments with deadlines and rubrics.
- Toggle submission status persisted to the database.

### 👥 5. Peer Circles & Study Groups
- Join topic-focused study squads (e.g., *Algorithms Sprint Squad*, *DBMS Builders*).
- Display weekly schedules, member counts, and study goals.
- Create new study groups with one click.

### 📊 6. Analytics & Performance Tracking
- **Student View:** 8-week mastery trajectory area chart, topic breakdown bars, and tailored revision recommendations.
- **Faculty View:** Cohort distribution charts, early intervention signals highlighting students needing additional office hours, and section rosters.

### 🔐 7. Authentication & Role Switcher
- Supabase Authentication support (Sign In, Sign Up, Profile Sync).
- One-click Hackathon Demo buttons (`Student View` vs. `Faculty View`) for instant evaluation.
- Live Supabase connection indicator badge in the top navigation bar.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite 6
- **Styling:** Custom CSS Design System with responsive mobile/tablet breakpoints
- **Data Visualization:** Recharts (Area Charts & Bar Charts)
- **Icons:** Lucide React
- **Database & Backend:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth (Session persistence, JWT, RLS policies)
- **Serverless Architecture:** Vercel Serverless Functions (`/api/ai`)

---

## 3. Project File Structure

```text
educonnect-ai/
├── api/
│   └── ai.js                         # Vercel serverless function (safe AI execution)
├── public/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx             # Sign in, Sign up, and 1-click Demo accounts
│   │   ├── CollaborationView.jsx     # Study groups and peer circles
│   │   ├── CoursesView.jsx           # Catalog, syllabus inspection, and enrollment
│   │   ├── LandingPage.jsx           # Public presentation hero & features showcase
│   │   └── ProfileView.jsx           # Student profile & Supabase connection monitor
│   ├── context/
│   │   └── AuthContext.jsx           # Global authentication state & role manager
│   ├── services/
│   │   ├── aiService.js              # Serverless bridge & educational engine
│   │   ├── assignmentsService.js     # Coursework queries and mutations
│   │   ├── authService.js            # Supabase auth & profile updates
│   │   ├── collaborationService.js   # Study group interactions
│   │   ├── coursesService.js         # Course catalog and student enrollment
│   │   └── doubtsService.js          # Doubt forum, replies, and faculty verification
│   ├── main.jsx                      # Main React application & dashboard shell
│   ├── styles.css                    # Unified modern aesthetic design system
│   └── supabaseClient.js             # Validated Supabase JS client configuration
├── supabase/
│   ├── migrations/
│   │   └── 20261010_initial_schema.sql
│   └── schema.sql                    # Full PostgreSQL schema, triggers, and RLS policies
├── .env.example                      # Template environment variable placeholders
├── .gitignore                        # Git ignore rules (protecting secrets and builds)
├── index.html                        # Application entry HTML
├── package.json                      # Project dependencies and npm scripts
├── vercel.json                       # Vercel SPA routing and serverless rewrites
└── README.md                         # Project documentation
```

---

## 4. Prerequisites

- **Node.js:** Version 18.0.0 or newer.
- **npm:** Included with Node.js.
- **Supabase Account (Free):** [https://supabase.com](https://supabase.com) (for cloud database & auth).
- **Vercel Account (Optional):** [https://vercel.com](https://vercel.com) (for serverless deployment).

---

## 5. Local Setup & Installation

### Step 1: Open Terminal in Project Folder
```bash
cd "C:\Users\Dell\Downloads\educonnect-ai-react-mvp\educonnect-ai"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open the local URL in your browser (usually `http://localhost:5173/` or `http://localhost:5174/`).

---

## 6. Supabase Cloud Configuration & Database Migrations

You can run EduConnect AI in **Offline Demo Mode** out of the box, or connect it to your live **Supabase PostgreSQL Cloud Database** in under 3 minutes:

### 1. Create a Supabase Project
1. Log in to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New Project**, select an organization, name it `EduConnect-AI`, choose a database password, and click **Create new project**.

### 2. Apply Database Schema & RLS Policies
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` from this project and paste it into the editor.
4. Click **Run**.
5. You will see:
   - Tables created: `profiles`, `courses`, `enrollments`, `doubts`, `doubt_replies`, `assignments`, `study_groups`, `ai_learning_history`.
   - Triggers for automatic profile generation on user signup.
   - Row Level Security (RLS) policies enabled on every table.
   - Initial sample courses and study groups seeded.

### 3. Get Project Credentials
1. In your Supabase Dashboard, click the **Settings** (gear icon) -> **API**.
2. Copy the **Project URL** (e.g., `https://abcdefghijkl.supabase.co`).
3. Copy the **Project API Keys** `anon` / `public` key.

### 4. Create `.env.local`
In the root of the project (`C:\Users\Dell\Downloads\educonnect-ai-react-mvp\educonnect-ai`), create a file named `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key_here
```

Restart your dev server:
```bash
npm run dev
```
The status pill in the top right will immediately show **✓ Supabase Cloud**!

---

## 7. Authentication Setup

- **Email Confirmation:** By default, Supabase sends confirmation emails. For testing, you can disable email confirmation under **Authentication -> Providers -> Email -> Confirm email: OFF** in your Supabase dashboard to allow instant signups.
- **Demo Quick Access:** Click on the top-right avatar and use the **1-Click Demo Access** buttons to switch between **Aarav Shah (Student)** and **Dr. Meera Rao (Faculty)**.

---

## 8. AI Learning Assistant Configuration

The AI Assistant works out of the box with an intelligent built-in academic knowledge engine.

To connect live OpenAI GPT models:
1. In `.env.local` or in your Vercel Project Environment Variables, add:
   ```env
   OPENAI_API_KEY=sk-...your-openai-api-key...
   ```
2. The serverless function `/api/ai` will automatically call OpenAI on the server side without exposing your key to the browser.

---

## 9. Vercel Deployment Guide

Deploying EduConnect AI to Vercel takes 2 minutes:

1. Push your repository to GitHub or GitLab.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import your `educonnect-ai` repository.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable/anon key.
   - `OPENAI_API_KEY`: (Optional) Your private OpenAI key.
5. Click **Deploy**.
6. Vercel will build the frontend and serve `/api/ai` as a serverless edge route automatically.

---

## 10. Common Issues & Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5173 is in use** | Another dev server is running | Vite will automatically use port 5174. Open the port indicated in your terminal. |
| **Status says "Demo Mode"** | `.env.local` missing or invalid URL | Check that `.env.local` has valid `VITE_SUPABASE_URL` starting with `https://`. |
| **RLS Permission Denied** | User not logged in | Ensure the user is signed in so `auth.uid()` matches the required policy. |
| **404 on page refresh on Vercel** | SPA routing not configured | The included `vercel.json` rewrite rules resolve this automatically. |

---

## 11. Hackathon Demonstration Workflow

For presenting to hackathon judges:

1. **Landing Page:** Start by clicking the brand logo or *Landing Overview* to present the problem statement, product vision, and architecture overview.
2. **Student Dashboard:** Show the personalized learning space, 8-week mastery trajectory chart, and upcoming deadlines.
3. **Course Catalog & Enrollment:** Navigate to **Courses**, search for *Database Systems*, inspect the syllabus modal, and click **Enroll Now**.
4. **Verified Doubt Forum:** Post a doubt titled *"When do we use 2NF vs 3NF?"*. Notice it appears as *Open*.
5. **Switch to Faculty:** Use the top-bar dropdown to switch to **Faculty View (Dr. Meera Rao)**. Open the newly created question, reply with an explanation, and observe the question automatically receive the **Faculty Verified** badge.
6. **AI Study Assistant:** Switch to the AI Assistant, select the prompt *"Explain DBMS normalization with 3NF example"*, generate guidance, and click **Post this question to Forum**.
7. **Assignments:** Open **Assignments**, add a new assignment milestone, and click **Mark Submitted** to see real-time completion analytics update.
8. **Cohort Analytics:** In Faculty View, click **Student Analytics** to demonstrate early intervention flags and cohort topic distributions.
