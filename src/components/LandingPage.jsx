import React from "react";
import {
  GraduationCap, Bot, MessageCircle, ClipboardCheck, ArrowUpRight,
  ShieldCheck, Sparkles, Users, BookOpen, CheckCircle2, ChevronRight, Zap
} from "lucide-react";

export function LandingPage({ onEnterApp, onOpenAuth }) {
  return (
    <div className="landing-wrap">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="brand-mark"><GraduationCap size={22} strokeWidth={2.4}/></div>
          <div>
            <div className="brand-name">educonnect<span>AI</span></div>
            <div className="brand-caption">ACADEMIC COLLABORATION PLATFORM</div>
          </div>
        </div>
        <div className="landing-nav-actions">
          <button className="secondary-button" onClick={() => onOpenAuth("login")}>Sign in</button>
          <button className="primary-button" onClick={() => onEnterApp()}>Launch platform <ArrowUpRight size={15}/></button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-pill">
          <Sparkles size={14}/> <span>POWERED BY SUPABASE & SERVERLESS AI</span>
        </div>
        <h1>Bridging Students, Faculty & <span>AI Learning</span> in Real Time.</h1>
        <p>
          EduConnect AI is a unified academic workspace designed for universities. Resolve doubts with faculty verification, track course progress, collaborate with peers, and get 24/7 AI-assisted study guidance.
        </p>

        <div className="landing-cta-row">
          <button className="primary-button landing-cta-btn" onClick={() => onEnterApp()}>
            Explore Interactive Demo <ArrowUpRight size={17}/>
          </button>
          <button className="secondary-button landing-cta-btn" onClick={() => onOpenAuth("register")}>
            Create Free Account
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="feature-icon purple"><MessageCircle size={22}/></div>
            <h3>Verified Doubt Forum</h3>
            <p>Students ask academic questions, peers collaborate, and faculty verify authoritative answers with official badges.</p>
          </div>

          <div className="landing-feature-card">
            <div className="feature-icon blue"><Bot size={22}/></div>
            <h3>AI Academic Assistant</h3>
            <p>Get clear conceptual breakdowns, instant practice quizzes, and revision schedules backed by secure serverless execution.</p>
          </div>

          <div className="landing-feature-card">
            <div className="feature-icon green"><BookOpen size={22}/></div>
            <h3>Courses & Mastery</h3>
            <p>Browse department courses, enroll with one click, and track your topic mastery across every semester.</p>
          </div>

          <div className="landing-feature-card">
            <div className="feature-icon orange"><Users size={22}/></div>
            <h3>Peer Study Groups</h3>
            <p>Form subject-specific study circles, coordinate problem-solving sprints, and share curated academic notes.</p>
          </div>
        </div>

        {/* Live Architecture Highlights */}
        <div className="landing-specs-card">
          <div className="specs-header">
            <div>
              <span className="eyebrow">PRODUCTION-READY ARCHITECTURE</span>
              <h2>Engineered for Scale & Security</h2>
            </div>
            <span className="live-badge"><Zap size={14}/> Vercel + Supabase Stack</span>
          </div>

          <div className="specs-list">
            <div className="spec-item">
              <CheckCircle2 size={16}/>
              <div>
                <strong>PostgreSQL with Row Level Security (RLS)</strong>
                <p>Private assignment records, student-owned AI logs, and faculty-verified authorizations protected at database layer.</p>
              </div>
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16}/>
              <div>
                <strong>Serverless AI Execution</strong>
                <p>Private credentials never exposed to client browsers; executed through Vercel serverless edge routes.</p>
              </div>
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16}/>
              <div>
                <strong>Dual Student & Faculty Workspaces</strong>
                <p>Toggle between Student learning tools and Faculty cohort performance analytics with early intervention signals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 EduConnect AI · Academic Collaboration Platform</div>
        <div className="landing-footer-links">
          <button onClick={() => onEnterApp()}>Explore Workspace</button>
          <span>·</span>
          <button onClick={() => onOpenAuth("login")}>Login</button>
          <span>·</span>
          <button onClick={() => onOpenAuth("register")}>Register</button>
        </div>
      </footer>
    </div>
  );
}

