import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

/* ==========================================
 * 1. Home Page Component
 * ========================================== */
function Home() {
  return (
    <div style={styles.card}>
      <h2 style={{ color: '#4f46e5' }}>🏠 Home Page</h2>
      <p style={{ marginTop: '10px', color: '#475569', lineHeight: '1.6' }}>
        Welcome! You are browsing a <strong>Single Page Application (SPA)</strong>.
        When you click links in the navigation bar above, the page <strong>does NOT reload</strong>.
        React Router intercepts the request and swaps the component instantaneously.
      </p>
      <div style={{ marginTop: '16px' }}>
        <Link to="/about" style={styles.button}>Go to About &rarr;</Link>
      </div>
    </div>
  );
}

/* ==========================================
 * 2. About Page Component
 * ========================================== */
function About() {
  return (
    <div style={styles.card}>
      <h2 style={{ color: '#4f46e5' }}>ℹ️ About Page</h2>
      <p style={{ marginTop: '10px', color: '#475569', lineHeight: '1.6' }}>
        This page demonstrates client-side navigation using React Router.
      </p>
      <ul style={{ marginTop: '12px', paddingLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
        <li><strong>BrowserRouter:</strong> Wraps your app and synchronizes the UI with the URL using HTML5 History API.</li>
        <li><strong>Routes:</strong> Container that renders the specific Route that matches the current pathname.</li>
        <li><strong>Route:</strong> Declares path to component mapping (<code>path="/"</code>, <code>path="/about"</code>, <code>path="/contact"</code>).</li>
        <li><strong>Link:</strong> Prevents standard browser reload by calling <code>event.preventDefault()</code> and <code>history.pushState()</code>.</li>
      </ul>
      <div style={{ marginTop: '16px' }}>
        <Link to="/contact" style={styles.button}>Contact Us &rarr;</Link>
      </div>
    </div>
  );
}

/* ==========================================
 * 3. Contact Page Component
 * ========================================== */
function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) setSubmitted(true);
  };

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#4f46e5' }}>✉️ Contact Page</h2>
      <p style={{ marginTop: '10px', color: '#475569' }}>
        Notice that entering text here and submitting happens entirely within client-side React state!
      </p>

      {submitted ? (
        <div style={styles.alert}>
          <strong>Message sent!</strong> Thank you for reaching out.
          <div style={{ marginTop: '10px' }}>
            <button style={styles.secondaryButton} onClick={() => { setSubmitted(false); setMessage(''); }}>
              Send Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <textarea
            rows="3"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.textarea}
            required
          />
          <button type="submit" style={styles.button}>Send Feedback</button>
        </form>
      )}
    </div>
  );
}

/* ==========================================
 * 4. Navigation Component (uses <Link>)
 * ========================================== */
function Navigation() {
  const location = useLocation();

  const getLinkStyle = (path) => ({
    ...styles.navLink,
    backgroundColor: location.pathname === path ? '#eef2ff' : 'transparent',
    color: location.pathname === path ? '#4f46e5' : '#475569',
    fontWeight: location.pathname === path ? '600' : '500',
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span>⚛️</span> React Router App
      </div>
      <div style={styles.navLinks}>
        {/* Link components replace regular <a href="..."> tags */}
        <Link to="/" style={getLinkStyle('/')}>Home</Link>
        <Link to="/about" style={getLinkStyle('/about')}>About</Link>
        <Link to="/contact" style={getLinkStyle('/contact')}>Contact</Link>
      </div>
    </nav>
  );
}

/* ==========================================
 * 5. Main Root App Component
 * ========================================== */
export default function SingleFileApp() {
  return (
    <BrowserRouter>
      <div style={styles.container}>
        <Navigation />

        <main style={{ marginTop: '24px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<div style={styles.card}><h2>404 - Page Not Found</h2></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

/* Inline Styles for zero-dependency portability */
const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '1.1rem',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  card: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  button: {
    display: 'inline-block',
    padding: '10px 18px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  secondaryButton: {
    padding: '8px 14px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  alert: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    color: '#065f46',
  },
};

