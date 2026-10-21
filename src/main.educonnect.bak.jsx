import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, Bot, CalendarDays,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, GraduationCap,
  LayoutDashboard, Lightbulb, LogOut, Menu, MessageCircle, MessageSquareText,
  Plus, Search, Send, ShieldCheck, Sparkles, Target, Users, X, Zap, BrainCircuit,
  ClipboardCheck, TrendingUp, Filter, MoreHorizontal, Bookmark, PanelLeftClose,
  Database, Key, ChevronRight, HelpCircle, User
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar
} from "recharts";
import "./styles.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { coursesService } from "./services/coursesService";
import { doubtsService } from "./services/doubtsService";
import { assignmentsService } from "./services/assignmentsService";
import { collaborationService } from "./services/collaborationService";
import { aiService } from "./services/aiService";

import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { CoursesView } from "./components/CoursesView";
import { CollaborationView } from "./components/CollaborationView";
import { ProfileView } from "./components/ProfileView";

const progressData = [
  { week: "W1", score: 58 }, { week: "W2", score: 62 }, { week: "W3", score: 59 },
  { week: "W4", score: 68 }, { week: "W5", score: 72 }, { week: "W6", score: 79 },
  { week: "W7", score: 76 }, { week: "W8", score: 84 },
];

const topicData = [
  { topic: "DBMS", mastery: 72 }, { topic: "DSA", mastery: 54 },
  { topic: "AI / ML", mastery: 81 }, { topic: "Networks", mastery: 66 },
];

const cohortStudents = [
  { name: "Aarav Patel", id: "CS24018", score: 84, attendance: 92, trend: "up", topics: ["DBMS"], status: "On track" },
  { name: "Priya Shah", id: "CS24026", score: 58, attendance: 78, trend: "down", topics: ["Data Structures", "Algorithms"], status: "Needs support" },
  { name: "Kabir Mehta", id: "CS24031", score: 72, attendance: 86, trend: "up", topics: ["AI / ML"], status: "On track" },
  { name: "Diya Desai", id: "CS24042", score: 46, attendance: 71, trend: "down", topics: ["DBMS", "SQL"], status: "Needs support" },
  { name: "Rohan Joshi", id: "CS24057", score: 91, attendance: 96, trend: "up", topics: [], status: "Excellent" },
];

function EduConnectApp() {
  const { user, profile, role, displayName, setRole, isConfigured } = useAuth();
  const [page, setPage] = useState("Overview"); // Overview, Courses, Doubt forum, AI study assistant, Assignments, Study groups, My progress, Student analytics, Profile, Landing
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [notice, setNotice] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // Database Data States
  const [courses, setCourses] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Doubt Forum States
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [newSubject, setNewSubject] = useState("Database Systems");

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState("explain"); // explain, quiz, plan
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Assignments Modal State
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentSubject, setNewAssignmentSubject] = useState("Database Systems");
  const [newAssignmentDate, setNewAssignmentDate] = useState("2026-10-18");
  const [newAssignmentDesc, setNewAssignmentDesc] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  // Load all data from real services / Supabase
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [coursesList, doubtsList, assignmentsList, groupsList] = await Promise.all([
        coursesService.getCourses(user?.id),
        doubtsService.getDoubts(),
        assignmentsService.getAssignments(user?.id),
        collaborationService.getStudyGroups(),
      ]);
      setCourses(coursesList);
      setDoubts(doubtsList);
      setAssignments(assignmentsList);
      setGroups(groupsList);
    } catch (err) {
      console.error("Error loading application data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Navigation Items
  const navItems = [
    { label: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
    { label: "Courses", icon: BookOpen, group: "WORKSPACE" },
    { label: "Doubt forum", icon: MessageCircle, group: "WORKSPACE", count: String(doubts.filter(d => !d.verified).length || 3) },
    { label: "AI study assistant", icon: Bot, group: "WORKSPACE" },
    { label: "Assignments", icon: ClipboardCheck, group: "LEARNING", count: String(assignments.filter(a => a.status === "Pending").length || 2) },
    { label: "Study groups", icon: Users, group: "LEARNING" },
    { label: "My progress", icon: TrendingUp, group: "LEARNING" },
    ...(role === "Faculty" ? [{ label: "Student analytics", icon: Activity, group: "FACULTY" }] : []),
  ];

  const go = (targetPage) => {
    setPage(targetPage);
    setMobileNav(false);
    setActiveDoubt(null);
  };

  // --- Doubt Handlers ---
  const handlePostDoubt = async () => {
    if (!newQuestionTitle.trim()) return;
    try {
      const created = await doubtsService.createDoubt({
        title: newQuestionTitle.trim(),
        question: newQuestionBody.trim() || newQuestionTitle.trim(),
        subject: newSubject,
        authorName: displayName,
        userId: user?.id,
        tag: "Academic",
      });
      setDoubts([created, ...doubts]);
      setNewQuestionTitle("");
      setNewQuestionBody("");
      setShowAskModal(false);
      setPage("Doubt forum");
      notify("Your question was posted to the forum.");
    } catch (err) {
      notify("Could not post question. Check database.");
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !activeDoubt) return;
    try {
      const isFac = role === "Faculty";
      const reply = await doubtsService.addReply({
        doubtId: activeDoubt.id,
        response: replyText.trim(),
        authorName: displayName,
        userId: user?.id,
        isFaculty: isFac,
      });

      const updatedDoubt = {
        ...activeDoubt,
        replies_count: (activeDoubt.replies_count || 0) + 1,
        status: isFac ? "Faculty answered" : activeDoubt.status,
        verified: isFac ? true : activeDoubt.verified,
        responses: [...(activeDoubt.responses || []), reply],
      };

      setDoubts(doubts.map(d => d.id === activeDoubt.id ? updatedDoubt : d));
      setActiveDoubt(updatedDoubt);
      setReplyText("");
      notify(isFac ? "Verified faculty answer posted!" : "Reply added to discussion.");
    } catch (err) {
      notify("Failed to post reply.");
    }
  };

  // --- Courses Handlers ---
  const handleEnrollCourse = async (courseId) => {
    await coursesService.enrollCourse(user?.id, courseId);
    setCourses(courses.map(c => c.id === courseId ? { ...c, enrolled: true, progress: 15 } : c));
  };

  // --- Assignments Handlers ---
  const handleToggleAssignmentStatus = async (assignmentId, currentStatus) => {
    const nextStatus = currentStatus === "Submitted" ? "Pending" : "Submitted";
    try {
      await assignmentsService.markStatus(assignmentId, nextStatus);
      setAssignments(assignments.map(a => a.id === assignmentId ? { ...a, status: nextStatus } : a));
      notify(nextStatus === "Submitted" ? "Assignment marked as submitted!" : "Assignment reopened as pending.");
    } catch (err) {
      notify("Could not update assignment status.");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;
    try {
      const created = await assignmentsService.createAssignment({
        title: newAssignmentTitle.trim(),
        subject: newAssignmentSubject,
        dueDate: newAssignmentDate,
        description: newAssignmentDesc.trim(),
        userId: user?.id,
        tone: "purple",
      });
      setAssignments([created, ...assignments]);
      setNewAssignmentTitle("");
      setNewAssignmentDesc("");
      setShowCreateAssignment(false);
      notify("New coursework assignment added!");
    } catch (err) {
      notify("Failed to create assignment.");
    }
  };

  // --- Collaboration Handlers ---
  const handleToggleMembership = async (groupId) => {
    const updated = await collaborationService.toggleMembership(groupId);
    setGroups(groups.map(g => g.id === groupId ? updated : g));
  };

  const handleCreateGroup = async (groupData) => {
    const created = await collaborationService.createGroup(groupData);
    setGroups([created, ...groups]);
  };

  // --- AI Tutor Handler ---
  const handleRunAI = async (overridePrompt, overrideMode) => {
    const promptToUse = (overridePrompt || aiPrompt).trim();
    const modeToUse = overrideMode || aiMode;
    if (!promptToUse) return;

    setAiLoading(true);
    setAiAnswer(null);
    try {
      const response = await aiService.askTutor({
        prompt: promptToUse,
        mode: modeToUse,
        userId: user?.id,
      });
      setAiAnswer(response);
    } catch (err) {
      notify("AI Tutor could not generate a response.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Doubts
  const filteredDoubts = useMemo(() => {
    return doubts.filter(d => {
      const matchesQuery = `${d.title} ${d.subject} ${d.author_name || ""}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || (filter === "Unanswered" && !d.verified) || (filter === "Verified" && d.verified);
      return matchesQuery && matchesFilter;
    });
  }, [doubts, query, filter]);

  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("");

  // If user navigated to Landing Page
  if (page === "Landing") {
    return (
      <>
        <LandingPage
          onEnterApp={() => setPage("Overview")}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onNotify={notify}
        />
        {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand" onClick={() => go("Landing")} style={{ cursor: "pointer" }} title="View Public Landing Page">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.4}/></div>
          <div>
            <div className="brand-name">educonnect<span>AI</span></div>
            <div className="brand-caption">ACADEMIC COLLABORATION</div>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button>
        </div>

        {/* Workspace Chip */}
        <div className="workspace-chip" onClick={() => go("Landing")} style={{ cursor: "pointer" }}>
          <span className="workspace-dot"/>
          <span>Computer Science</span>
          <ChevronDown size={14}/>
        </div>

        {/* Navigation Groups */}
        {["WORKSPACE", "LEARNING", ...(role === "Faculty" ? ["FACULTY"] : [])].map(group => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>
            {navItems.filter(n => n.group === group).map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`nav-item ${page === item.label ? "active" : ""}`}
                  onClick={() => go(item.label)}
                >
                  <Icon size={18}/>
                  <span>{item.label}</span>
                  {item.count && <span className="nav-count">{item.count}</span>}
                </button>
              );
            })}
          </div>
        ))}

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Lightbulb size={17}/></div>
            <div>
              <strong>24/7 AI Tutor</strong>
              <p>Conceptual breakdowns & exam practice quizzes.</p>
              <button onClick={() => go("AI study assistant")}>Ask AI assistant <span>↗</span></button>
            </div>
          </div>

          <button className="nav-item muted-nav" onClick={() => go("Landing")}>
            <HelpCircle size={18}/><span>Landing Overview</span>
          </button>

          <div className="profile-row" onClick={() => go("Profile")} style={{ cursor: "pointer" }}>
            <div className="avatar">{initials}</div>
            <div className="profile-meta">
              <strong>{displayName}</strong>
              <span>{role} Account</span>
            </div>
            <button className="icon-button" onClick={(e) => { e.stopPropagation(); go("Profile"); }} aria-label="Profile options">
              <MoreHorizontal size={19}/>
            </button>
          </div>
        </div>
      </aside>

      {mobileNav && <div className="mobile-overlay" onClick={() => setMobileNav(false)} />}

      {/* Main Content Area */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation">
              <Menu size={20}/>
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{page}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Database indicator */}
            <div
              className={`cloud-indicator-pill ${isConfigured ? "online" : "demo"}`}
              onClick={() => go("Profile")}
              style={{ cursor: "pointer" }}
              title="Click to view database connectivity details"
            >
              <Database size={13}/>
              <span>{isConfigured ? "Supabase Cloud" : "Demo Mode"}</span>
            </div>

            {/* Role Switcher */}
            <label className="role-switch">
              <span>View as</span>
              <select
                value={role}
                onChange={e => {
                  setRole(e.target.value);
                  if (e.target.value === "Faculty" && page === "My progress") setPage("Overview");
                  notify(`Switched to ${e.target.value} perspective`);
                }}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </label>

            {/* Notifications */}
            <button className="icon-button notification-button" onClick={() => setNotice(!notice)} aria-label="Notifications">
              <Bell size={19}/><i/>
            </button>
            {notice && (
              <div className="notification-pop">
                <strong>Academic Updates</strong>
                <p><span className="tiny-dot"/>{role === "Faculty" ? "2 students flagged for early intervention." : "Your DBMS normalization assignment is due tomorrow."}</p>
                <p><span className="tiny-dot"/>{role === "Faculty" ? "3 new questions waiting for faculty review." : "Dr. Rao verified an answer in the forum."}</p>
              </div>
            )}

            {/* Profile Avatar */}
            <div
              className="top-avatar"
              onClick={() => {
                if (user) go("Profile");
                else setAuthModalOpen(true);
              }}
              style={{ cursor: "pointer" }}
              title="Account & Authentication"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="page-content">
          {page === "Overview" && (
            <Overview
              role={role}
              displayName={displayName}
              go={go}
              notify={notify}
              setShowAsk={() => setShowAskModal(true)}
              coursesCount={courses.filter(c => c.enrolled).length || 4}
              assignmentsCount={assignments.filter(a => a.status === "Pending").length}
              doubtsCount={doubts.length}
              recentDoubts={doubts.slice(0, 2)}
              upcomingAssignments={assignments.slice(0, 3)}
            />
          )}

          {page === "Courses" && (
            <CoursesView
              courses={courses}
              onEnroll={handleEnrollCourse}
              notify={notify}
              loading={loadingData}
            />
          )}

          {page === "Doubt forum" && (
            <section>
              <PageHeading
                eyebrow="COMMUNITY LEARNING"
                title="Doubt forum"
                description="Ask academic questions, collaborate with peers, and receive verified answers from professors."
                action={
                  <button className="primary-button" onClick={() => setShowAskModal(true)}>
                    <Plus size={17}/> Ask a question
                  </button>
                }
              />

              <div className="forum-toolbar">
                <div className="search-field">
                  <Search size={17}/>
                  <input
                    placeholder="Search questions, subjects, or authors..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
                <div className="filter-pills">
                  {["All", "Unanswered", "Verified"].map(f => (
                    <button
                      key={f}
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="forum-layout">
                {/* Questions List */}
                <div className="question-list">
                  {filteredDoubts.map(q => (
                    <button
                      className={`question-card ${activeDoubt?.id === q.id ? "question-active" : ""}`}
                      key={q.id}
                      onClick={() => setActiveDoubt(q)}
                    >
                      <div className="question-top">
                        <span className="subject-tag">{q.subject}</span>
                        {q.verified && (
                          <span className="verified-tag">
                            <ShieldCheck size={13}/> Verified
                          </span>
                        )}
                      </div>
                      <h3>{q.title}</h3>
                      <p className="question-body">{q.question || q.body}</p>
                      <div className="question-footer">
                        <span>
                          <div className="mini-avatar">
                            {(q.author_name || "ST").split(" ").map(x=>x[0]).slice(0,2).join("")}
                          </div>
                          {q.author_name}
                        </span>
                        <span><Clock3 size={14}/> {q.time || "Recently"}</span>
                        <span><MessageCircle size={14}/> {q.replies_count || 0} replies</span>
                      </div>
                    </button>
                  ))}
                  {filteredDoubts.length === 0 && (
                    <div className="empty-state">No questions found matching your search.</div>
                  )}
                </div>

                {/* Detail Discussion Panel */}
                <div className="detail-panel">
                  {activeDoubt ? (
                    <>
                      <div className="detail-head">
                        <span className="subject-tag">{activeDoubt.subject}</span>
                        <button className="icon-button" onClick={() => setActiveDoubt(null)} aria-label="Close question">
                          <X size={17}/>
                        </button>
                      </div>
                      <h2>{activeDoubt.title}</h2>
                      <p className="detail-meta">Asked by {activeDoubt.author_name} · {activeDoubt.time || "Recently"}</p>
                      <p className="detail-copy">{activeDoubt.question || activeDoubt.body}</p>

                      {/* Display replies */}
                      {activeDoubt.responses && activeDoubt.responses.length > 0 && (
                        <div className="doubt-responses-list">
                          {activeDoubt.responses.map((resp, i) => (
                            <div className="faculty-answer" key={resp.id || i}>
                              <div className="answer-title">
                                <ShieldCheck size={16}/>
                                {resp.is_faculty ? "Verified Faculty Answer" : `Reply from ${resp.author_name}`}
                              </div>
                              <p>{resp.response}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="reply-label">
                        {role === "Faculty" ? "Reply as Faculty (Marks as Verified)" : "Add your peer explanation"}
                      </div>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Share a step-by-step explanation or ask a follow-up..."
                        rows={4}
                      />
                      <button className="primary-button full-button" onClick={handlePostReply}>
                        <Send size={15}/> Post reply
                      </button>
                      <p className="detail-hint">
                        {role === "Faculty"
                          ? "Faculty replies are automatically badged with green verification tags."
                          : "Be constructive and explain your reasoning clearly."}
                      </p>
                    </>
                  ) : (
                    <div className="detail-empty">
                      <div className="empty-icon"><MessageSquareText size={24}/></div>
                      <h3>Join the conversation</h3>
                      <p>Select a question from the left to read verified solutions and contribute replies.</p>
                      <button className="text-button" onClick={() => setShowAskModal(true)}>
                        Ask your first question <ArrowUpRight size={15}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {page === "AI study assistant" && (
            <section>
              <PageHeading
                eyebrow="YOUR 24/7 STUDY MENTOR"
                title="AI study assistant"
                description="Get step-by-step conceptual breakdowns, generate instant practice quizzes, and plan your study sprint."
              />

              <div className="ai-page-grid">
                <div className="ai-main-card">
                  <div className="ai-card-title">
                    <div className="ai-orb"><Sparkles size={22}/></div>
                    <div>
                      <h2>What are you learning today?</h2>
                      <p>Type any academic concept, formula, or exam question below.</p>
                    </div>
                  </div>

                  {/* Mode selector pills */}
                  <div className="ai-mode-pills" style={{ display: "flex", gap: "8px", margin: "16px 0 10px" }}>
                    {[
                      { id: "explain", label: "Concept Explainer" },
                      { id: "quiz", label: "Practice Quiz" },
                      { id: "plan", label: "Study Plan" },
                    ].map(m => (
                      <button
                        key={m.id}
                        className={aiMode === m.id ? "primary-button small" : "secondary-button small"}
                        onClick={() => setAiMode(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Sample prompt chips */}
                  <div className="prompt-chips">
                    {[
                      "Explain DBMS normalization with 3NF example",
                      "How to calculate time complexity for nested loops",
                      "Supervised vs Unsupervised machine learning",
                      "Generate a 3-question quiz on B-Trees",
                    ].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setAiPrompt(p);
                          handleRunAI(p, aiMode);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <textarea
                    className="ai-input"
                    rows={4}
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="e.g. Explain difference between 2NF and 3NF with a simple real-world table schema..."
                  />

                  <div className="ai-input-bottom">
                    <span>
                      <ShieldCheck size={14}/> Serverless AI integration · Educational mentor
                    </span>
                    <button
                      className="primary-button"
                      onClick={() => handleRunAI()}
                      disabled={aiLoading || !aiPrompt.trim()}
                    >
                      <Sparkles size={16}/> {aiLoading ? "Thinking..." : "Generate Guidance"}
                    </button>
                  </div>

                  {aiAnswer && (
                    <div className="ai-answer">
                      <div className="answer-title">
                        <Bot size={17}/> {aiAnswer.source || "EduConnect AI Tutor"}
                        {aiAnswer.live ? (
                          <span className="demo-label" style={{ background: "#eaf8f2", color: "#329a76" }}>LIVE AI MODEL</span>
                        ) : (
                          <span className="demo-label">SERVERLESS BRIDGE</span>
                        )}
                      </div>
                      <p style={{ whiteSpace: "pre-line" }}>{aiAnswer.answer}</p>
                      {aiAnswer.note && <div className="answer-source">{aiAnswer.note}</div>}

                      <button
                        className="secondary-button"
                        onClick={() => {
                          setNewQuestionTitle(aiPrompt);
                          setNewQuestionBody(aiAnswer.answer);
                          setShowAskModal(true);
                        }}
                      >
                        Post this question to Forum <ArrowUpRight size={15}/>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right side suggestions */}
                <div className="suggestion-card">
                  <div className="suggestion-icon"><Target size={19}/></div>
                  <h3>Make steady academic progress</h3>
                  <p>Use targeted study modes to master difficult concepts prior to lab assessments.</p>
                  <div className="suggestion-row">
                    <span className="suggestion-number">01</span>
                    <div>
                      <strong>Understand the concept</strong>
                      <p>Ask for plain-language analogies and real-world database models.</p>
                    </div>
                  </div>
                  <div className="suggestion-row">
                    <span className="suggestion-number">02</span>
                    <div>
                      <strong>Self-test with practice quizzes</strong>
                      <p>Switch to "Practice Quiz" mode to generate rapid recall questions.</p>
                    </div>
                  </div>
                  <div className="suggestion-row">
                    <span className="suggestion-number">03</span>
                    <div>
                      <strong>Plan your sprint</strong>
                      <p>Generate a structured 3-day revision schedule for upcoming deadlines.</p>
                    </div>
                  </div>
                  <div className="demo-note">
                    <Zap size={15}/> Integrated with Vercel serverless edge routes (`/api/ai`).
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "Assignments" && (
            <section>
              <PageHeading
                eyebrow="COURSEWORK TRACKER"
                title={role === "Faculty" ? "Assignments & Submissions" : "Assignments"}
                description={
                  role === "Faculty"
                    ? "Review student submission statuses and publish new coursework."
                    : "Track assignments, meet submission deadlines, and mark deliverables complete."
                }
                action={
                  <button className="primary-button" onClick={() => setShowCreateAssignment(true)}>
                    <Plus size={16}/> Create assignment
                  </button>
                }
              />

              <div className="assignment-summary">
                <div className="summary-box">
                  <span>Total coursework</span>
                  <strong>{assignments.length}</strong>
                </div>
                <div className="summary-box">
                  <span>Pending</span>
                  <strong>{assignments.filter(a => a.status === "Pending").length}</strong>
                </div>
                <div className="summary-box">
                  <span>Submitted</span>
                  <strong>{assignments.filter(a => a.status === "Submitted").length}</strong>
                </div>
                <div className="summary-box">
                  <span>Completion Rate</span>
                  <strong>
                    {assignments.length > 0
                      ? `${Math.round((assignments.filter(a => a.status === "Submitted").length / assignments.length) * 100)}%`
                      : "100%"}
                  </strong>
                </div>
              </div>

              <div className="panel assignment-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Active Coursework</h3>
                    <p>Fall Semester 2026 · Saved to Database</p>
                  </div>
                  <span className="table-count">{assignments.length} items</span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ASSIGNMENT</th>
                        <th>DUE DATE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div className="assignment-name">
                              <span className={`assignment-icon ${a.tone || "purple"}`}>
                                <BookOpen size={17}/>
                              </span>
                              <div>
                                <strong>{a.title}</strong>
                                <span>{a.subject} · {a.type || "Deliverable"}</span>
                              </div>
                            </div>
                          </td>
                          <td>{a.due_text || "TBD"}</td>
                          <td>
                            <span className={`status-pill ${a.status === "Submitted" ? "status-done" : "status-pending"}`}>
                              <i/> {a.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className={a.status === "Submitted" ? "secondary-button small" : "primary-button small"}
                              onClick={() => handleToggleAssignmentStatus(a.id, a.status)}
                            >
                              {a.status === "Submitted" ? "Reopen as Pending" : "Mark Submitted"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {page === "Study groups" && (
            <CollaborationView
              groups={groups}
              onToggleMembership={handleToggleMembership}
              onCreateGroup={handleCreateGroup}
              notify={notify}
              loading={loadingData}
            />
          )}

          {page === "My progress" && <Progress notify={notify}/>}
          {page === "Student analytics" && <Analytics notify={notify}/>}
          {page === "Profile" && (
            <ProfileView
              notify={notify}
              onOpenAuth={(mode) => {
                setAuthModalMode(mode);
                setAuthModalOpen(true);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <span>© 2026 EduConnect AI · Academic Collaboration Platform</span>
          <span>
            <span className="footer-status"/> {isConfigured ? "Supabase Cloud Database Online" : "Local Demo Database Active"}
            <span className="footer-divider">·</span> Hackathon Production Ready
          </span>
        </footer>
      </main>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="modal-backdrop" onClick={() => setShowAskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">COMMUNITY LEARNING</span>
                <h2>Ask a Question</h2>
              </div>
              <button className="icon-button" onClick={() => setShowAskModal(false)} aria-label="Close">
                <X size={19}/>
              </button>
            </div>
            <p className="modal-subtitle">Share what you are stuck on. Peers and faculty will help explain.</p>

            <label className="field-label">Subject</label>
            <select className="form-select" value={newSubject} onChange={e => setNewSubject(e.target.value)}>
              <option>Database Systems</option>
              <option>Data Structures</option>
              <option>Artificial Intelligence</option>
              <option>Software Engineering</option>
              <option>Computer Networks</option>
            </select>

            <label className="field-label">Question Title</label>
            <input
              className="form-input"
              placeholder="e.g. Can someone explain 2NF vs 3NF with an example?"
              value={newQuestionTitle}
              onChange={e => setNewQuestionTitle(e.target.value)}
              required
            />

            <label className="field-label">Detailed Explanation (Optional)</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={newQuestionBody}
              onChange={e => setNewQuestionBody(e.target.value)}
              placeholder="Provide context or what you've tried so far..."
            />

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowAskModal(false)}>Cancel</button>
              <button className="primary-button" disabled={!newQuestionTitle.trim()} onClick={handlePostDoubt}>
                <Send size={15}/> Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="modal-backdrop" onClick={() => setShowCreateAssignment(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">COURSEWORK</span>
                <h2>Add New Assignment</h2>
              </div>
              <button className="icon-button" onClick={() => setShowCreateAssignment(false)} aria-label="Close">
                <X size={19}/>
              </button>
            </div>
            <p className="modal-subtitle">Keep your academic deliverables tracked and on schedule.</p>

            <form onSubmit={handleCreateAssignment}>
              <label className="field-label">Assignment Title</label>
              <input
                className="form-input"
                placeholder="e.g. B-Trees and Indexing problem set"
                value={newAssignmentTitle}
                onChange={e => setNewAssignmentTitle(e.target.value)}
                required
              />

              <div className="auth-row-fields">
                <div>
                  <label className="field-label">Subject</label>
                  <select className="form-select" value={newAssignmentSubject} onChange={e => setNewAssignmentSubject(e.target.value)}>
                    <option>Database Systems</option>
                    <option>Data Structures</option>
                    <option>Artificial Intelligence</option>
                    <option>Software Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newAssignmentDate}
                    onChange={e => setNewAssignmentDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="field-label">Instructions / Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Include deliverable specifications or rubric criteria..."
                value={newAssignmentDesc}
                onChange={e => setNewAssignmentDesc(e.target.value)}
              />

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreateAssignment(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={!newAssignmentTitle.trim()}>
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onNotify={notify}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18}/>
          {toast}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENTS
// -------------------------------------------------------------

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function Overview({ role, displayName, go, notify, setShowAsk, coursesCount, assignmentsCount, doubtsCount, recentDoubts, upcomingAssignments }) {
  const faculty = role === "Faculty";
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">{faculty ? "FACULTY PORTAL" : "STUDENT WORKSPACE"}</div>
          <h1>{faculty ? `Good morning, ${displayName}` : `Good morning, ${displayName}`} <span className="wave">✦</span></h1>
          <p>{faculty ? "Here is your class overview. Early feedback and timely answers make a major difference." : "Ready to make progress? Here is your personalized academic dashboard for today."}</p>
        </div>
        <div className="welcome-date"><CalendarDays size={16}/> Monday, 12 October</div>
      </div>

      <div className="hero-banner">
        <div className="hero-glow"/>
        <div className="hero-content">
          <div className="hero-kicker"><Sparkles size={14}/> {faculty ? "FACULTY ACADEMIC SUITE" : "YOUR PERSONAL LEARNING COMPANION"}</div>
          <h2>{faculty ? <>Empowering every student.<br/><span>Data-driven insights.</span></> : <>Your academic goals are<br/>closer than you <span>think.</span></>}</h2>
          <p>{faculty ? "Identify learning bottlenecks early and give students the personalized attention they need." : "Build momentum with focused study sessions and resolve blockers in the faculty-verified doubt forum."}</p>
          <button className="hero-button" onClick={() => go(faculty ? "Student analytics" : "AI study assistant")}>
            {faculty ? "Review student cohort" : "Explore study assistant"} <ArrowUpRight size={16}/>
          </button>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one"/>
          <div className="orbit orbit-two"/>
          <div className="hero-core"><BrainCircuit size={42}/></div>
          <div className="float-card float-top">
            <span className="float-icon purple"><Sparkles size={15}/></span>
            <div><strong>{faculty ? "Cohort signals" : "Smart learning"}</strong><small>{faculty ? "2 students flagged" : "Real-time verification"}</small></div>
          </div>
          <div className="float-card float-bottom">
            <span className="float-icon green"><Check size={16}/></span>
            <div><strong>{faculty ? "Course sync" : "Weekly consistency"}</strong><small>{faculty ? "4 active sections" : "4 of 5 sessions complete"}</small></div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={BookOpen} tone="purple" label={faculty ? "Active sections" : "Enrolled courses"} value={String(coursesCount)} change="Semester 2026" trend="up"/>
        <StatCard icon={ClipboardCheck} tone="blue" label={faculty ? "Pending reviews" : "Assignments due"} value={String(assignmentsCount)} change="Upcoming deadlines" trend="neutral"/>
        <StatCard icon={Activity} tone="green" label={faculty ? "Class average" : "Overall mastery"} value={faculty ? "76.4%" : "78.5%"} change="+4.2% this month" trend="up"/>
        <StatCard icon={MessageCircle} tone="orange" label="Forum questions" value={String(doubtsCount)} change="Community active" trend="neutral"/>
      </div>

      <div className="content-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h3>{faculty ? "Class assessment curve" : "Your mastery trajectory"}</h3>
              <p>{faculty ? "Average assessment scores across 8 weeks" : "Weekly quiz performance curve"}</p>
            </div>
            <button className="period-select" onClick={() => notify("Displaying 8-week assessment performance")}>Last 8 weeks <ChevronDown size={14}/></button>
          </div>
          <div className="chart-summary">
            <strong>{faculty ? "76.4%" : "78.5%"}</strong>
            <span className="positive"><ArrowUpRight size={14}/> 6.4%</span>
            <span className="chart-summary-note">vs. previous period</span>
          </div>
          <div className="area-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{top:10,right:8,left:-24,bottom:0}}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7664e8" stopOpacity={0.22}/>
                    <stop offset="95%" stopColor="#7664e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f6" vertical={false}/>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill:"#98a0b4",fontSize:11}} dy={8}/>
                <YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:"#98a0b4",fontSize:11}} ticks={[0,25,50,75,100]}/>
                <Tooltip contentStyle={{border:"1px solid #ececf4",borderRadius:12,fontSize:12}} formatter={v=>[`${v}%`,"Score"]}/>
                <Area type="monotone" dataKey="score" stroke="#7664e8" strokeWidth={2.5} fill="url(#scoreGradient)" activeDot={{r:5,strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel tasks-panel">
          <div className="panel-heading">
            <div>
              <h3>Upcoming deadlines</h3>
              <p>Stay on track with your academic milestones</p>
            </div>
            <button className="text-button" onClick={() => go("Assignments")}>View all <ArrowUpRight size={14}/></button>
          </div>
          {upcomingAssignments.map((t) => (
            <div className="task-row" key={t.id || t.title}>
              <div className={`task-date ${t.tone || "purple"}`}>
                <span>DUE</span>
                <strong>OCT</strong>
              </div>
              <div className="task-info">
                <span className="task-overline">{t.subject}</span>
                <strong>{t.title}</strong>
                <p>{t.due_text || "Upcoming"}</p>
              </div>
              <button className="task-more icon-button" onClick={() => go("Assignments")} aria-label="Open assignment">
                <ChevronRight size={18}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel forum-preview">
          <div className="panel-heading">
            <div>
              <h3>Recent forum discussions</h3>
              <p>Peer questions and verified professor solutions</p>
            </div>
            <button className="text-button" onClick={() => go("Doubt forum")}>Open forum <ArrowUpRight size={14}/></button>
          </div>
          {recentDoubts.map(q => (
            <button className="discussion-row" key={q.id} onClick={() => go("Doubt forum")}>
              <div className="discussion-icon"><MessageSquareText size={17}/></div>
              <div className="discussion-info">
                <strong>{q.title}</strong>
                <p>{q.subject} <span>·</span> {q.replies_count || 0} replies</p>
              </div>
              {q.verified ? (
                <span className="verified-tag"><ShieldCheck size={13}/> Verified</span>
              ) : (
                <span className="open-tag">Open</span>
              )}
            </button>
          ))}
        </div>

        <div className="panel insight-panel">
          <div className="insight-top">
            <div className="insight-icon"><Sparkles size={18}/></div>
            <span className="insight-label">INTELLIGENT INSIGHT</span>
          </div>
          <h3>{faculty ? "Early guidance changes the trajectory." : "Consistent practice leads to mastery."}</h3>
          <p>
            {faculty
              ? "2 students in Database Systems scored below 60% on normalization. Recommend a short revision seminar before next quiz."
              : "Your DBMS normalization confidence is high! Try tackling nested subqueries or run an AI practice quiz today."}
          </p>
          <button className="insight-link" onClick={() => go(faculty ? "Student analytics" : "AI study assistant")}>
            {faculty ? "Review student cohort" : "Start 10-min quiz"} <ArrowUpRight size={15}/>
          </button>
          <div className="insight-decoration"><BrainCircuit size={76}/></div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, tone, label, value, change, trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19}/></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${trend === "up" ? "positive" : ""}`}>
        {trend === "up" ? <ArrowUpRight size={14}/> : <Clock3 size={13}/>} {change}
      </div>
    </div>
  );
}

function Progress({ notify }) {
  return (
    <section>
      <PageHeading
        eyebrow="YOUR ACADEMIC GROWTH"
        title="My progress"
        description="Understand your subject strengths, spot topic gaps, and plan your study time effectively."
      />

      <div className="stats-grid progress-stats">
        <StatCard icon={Target} tone="purple" label="Overall mastery" value="72%" change="+8% this month" trend="up"/>
        <StatCard icon={TrendingUp} tone="green" label="Average score" value="78.5%" change="+6.4% this month" trend="up"/>
        <StatCard icon={CalendarDays} tone="blue" label="Study consistency" value="4.8 days" change="Per week on average" trend="neutral"/>
        <StatCard icon={CheckCircle2} tone="orange" label="Topics completed" value="18/25" change="7 topics remaining" trend="neutral"/>
      </div>

      <div className="content-grid progress-content">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Topic mastery breakdown</h3>
              <p>Based on continuous assignments, quizzes, and forum interactions</p>
            </div>
          </div>
          <div className="mastery-list">
            {topicData.map(t => (
              <div className="mastery-item" key={t.topic}>
                <div className="mastery-top">
                  <strong>{t.topic}</strong>
                  <span>{t.mastery}%</span>
                </div>
                <div className="mastery-track">
                  <div className={`mastery-fill ${t.mastery < 60 ? "needs-work" : ""}`} style={{ width: `${t.mastery}%` }}/>
                </div>
                <span className="mastery-note">
                  {t.mastery < 60 ? "Needs additional practice" : t.mastery < 75 ? "Making steady progress" : "Looking excellent"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel recommendation-panel">
          <div className="insight-top">
            <div className="insight-icon"><Sparkles size={18}/></div>
            <span className="insight-label">RECOMMENDED FOCUS</span>
          </div>
          <h3>Focus on Data Structures</h3>
          <p>Your recent quiz scores indicate that nested loop complexity and graph traversals will benefit from targeted review.</p>
          <div className="recommendation-task"><CheckCircle2 size={17}/><span>Review asymptotic bounds & Big-O rules</span></div>
          <div className="recommendation-task"><CheckCircle2 size={17}/><span>Practice 5 nested loop problem sets</span></div>
          <div className="recommendation-task"><CheckCircle2 size={17}/><span>Ask a clarifying doubt in the forum</span></div>
          <button className="primary-button full-button" onClick={() => notify("Study sprint added to your schedule!")}>
            Start Study Sprint <ArrowUpRight size={15}/>
          </button>
        </div>
      </div>
    </section>
  );
}

function Analytics({ notify }) {
  const flagged = cohortStudents.filter(s => s.score < 60 || s.attendance < 75);
  return (
    <section>
      <PageHeading
        eyebrow="FACULTY COHORT INSIGHTS"
        title="Student analytics"
        description="Monitor section-level trends, identify students who need early support, and plan timely academic interventions."
        action={
          <button className="secondary-button" onClick={() => notify("Cohort performance report exported.")}>
            <ClipboardCheck size={16}/> Export cohort report
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard icon={Users} tone="purple" label="Enrolled students" value="42" change="Across 2 sections" trend="neutral"/>
        <StatCard icon={Activity} tone="blue" label="Cohort average" value="76.4%" change="+3.2% this month" trend="up"/>
        <StatCard icon={Target} tone="orange" label="Early intervention" value={String(flagged.length)} change="Students flagged" trend="neutral"/>
        <StatCard icon={MessageCircle} tone="green" label="Unverified doubts" value="3" change="Awaiting review" trend="neutral"/>
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Subject performance distribution</h3>
              <p>Section mastery by curriculum domain</p>
            </div>
          </div>
          <div className="topic-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 12, top: 5, bottom: 0 }}>
                <CartesianGrid stroke="#edf0f6" horizontal={false}/>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#98a0b4", fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="topic" width={72} tick={{ fill: "#6e768c", fontSize: 12 }} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v => [`${v}%`, "Mastery"]} contentStyle={{ borderRadius: 12, fontSize: 12 }}/>
                <Bar dataKey="mastery" fill="#7664e8" radius={[0, 6, 6, 0]} barSize={18}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel support-panel">
          <div className="panel-heading">
            <div>
              <h3>Early intervention signals</h3>
              <p>Students flagged for extra mentoring</p>
            </div>
            <span className="warning-count">{flagged.length} flagged</span>
          </div>
          {flagged.map(s => (
            <div className="support-row" key={s.id}>
              <div className="student-avatar">{s.name.split(" ").map(x => x[0]).join("")}</div>
              <div className="support-student">
                <strong>{s.name}</strong>
                <span>{s.topics.join(", ") || "General review"}</span>
              </div>
              <span className="score-badge">{s.score}%</span>
            </div>
          ))}
          <p className="support-disclaimer">Signals are prompts for constructive mentorship and office hours.</p>
        </div>
      </div>

      <div className="panel student-table-panel">
        <div className="panel-heading">
          <div>
            <h3>Cohort student roster</h3>
            <p>Real-time quiz averages and attendance rates</p>
          </div>
          <button className="text-button" onClick={() => notify("All student records are up to date.")}>View all <ArrowUpRight size={14}/></button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>QUIZ AVG.</th>
                <th>ATTENDANCE</th>
                <th>STATUS</th>
                <th>TREND</th>
              </tr>
            </thead>
            <tbody>
              {cohortStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">{s.name.split(" ").map(x => x[0]).join("")}</div>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.id}</span>
                      </div>
                    </div>
                  </td>
                  <td><strong>{s.score}%</strong></td>
                  <td>{s.attendance}%</td>
                  <td>
                    <span className={`status-pill ${s.status === "Needs support" ? "status-pending" : "status-done"}`}>
                      <i/> {s.status}
                    </span>
                  </td>
                  <td>
                    {s.trend === "up" ? (
                      <span className="positive"><ArrowUpRight size={15}/> Improving</span>
                    ) : (
                      <span className="negative"><ArrowDownRight size={15}/> Review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Render root with AuthProvider
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <EduConnectApp />
    </AuthProvider>
  );
}