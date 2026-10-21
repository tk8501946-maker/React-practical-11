import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container home-page">
      <div className="hero-badge">Welcome to SPA Navigation</div>
      <h1>Home Page</h1>
      <p className="lead-text">
        This is the Home page of our Single Page Application (SPA).
        Notice that when you navigate between pages, there is <strong>zero browser reloading</strong>!
      </p>

      <div className="feature-grid">
        <div className="card">
          <h3>⚡ Instant Page Transitions</h3>
          <p>React Router swaps components dynamically inside the DOM instead of requesting new HTML from a server.</p>
        </div>
        <div className="card">
          <h3>🔗 Client-Side Routing</h3>
          <p>Uses the HTML5 History API (<code>pushState</code>) to update the URL bar without a page refresh.</p>
        </div>
        <div className="card">
          <h3>💡 Preserved State</h3>
          <p>Application memory, JavaScript variables, and DOM states stay active without being wiped out.</p>
        </div>
      </div>

      <div className="cta-group">
        <Link to="/about" className="btn btn-primary">Learn About Us &rarr;</Link>
        <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
      </div>
    </div>
  );
}

