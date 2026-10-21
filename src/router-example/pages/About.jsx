import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-container about-page">
      <div className="hero-badge">About Us</div>
      <h1>About Page</h1>
      <p className="lead-text">
        Learn how React Router powers fluid, instantaneous client-side navigation.
      </p>

      <div className="card full-width">
        <h3>How React Router Works Under the Hood</h3>
        <p>
          In traditional multi-page web applications, clicking an anchor tag (<code>&lt;a href="..."&gt;</code>)
          sends an HTTP request to the web server, downloads a brand new HTML document, parses the scripts,
          and re-renders everything from scratch (causing a white flicker).
        </p>
        <p>
          With React Router's <code>&lt;BrowserRouter&gt;</code> and <code>&lt;Link&gt;</code>:
        </p>
        <ul className="bullet-list">
          <li><code>&lt;Link&gt;</code> intercepts the click event with <code>event.preventDefault()</code>.</li>
          <li>It invokes the browser's <code>window.history.pushState()</code> to update the browser URL.</li>
          <li>The router listens for path changes and selectively renders matching <code>&lt;Route&gt;</code> elements into the DOM.</li>
          <li>The header, navigation, and background remain mounted — no reload needed!</li>
        </ul>
      </div>

      <div className="cta-group">
        <Link to="/" className="btn btn-secondary">&larr; Back to Home</Link>
        <Link to="/contact" className="btn btn-primary">Contact Support &rarr;</Link>
      </div>
    </div>
  );
}

