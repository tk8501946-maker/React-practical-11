import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container contact-page">
      <div className="hero-badge">Get in Touch</div>
      <h1>Contact Us</h1>
      <p className="lead-text">
        Have questions about routing in React? Send us a message below.
      </p>

      <div className="contact-wrapper">
        <div className="card form-card">
          {submitted ? (
            <div className="success-banner">
              <h3>✅ Message Sent Successfully!</h3>
              <p>Thank you, <strong>{formData.name}</strong>. We received your note.</p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', message: '' });
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Type your question or feedback..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="contact-info-cards">
          <div className="card">
            <h4>📍 Address</h4>
            <p>123 Web Dev Avenue, Frontend City, Reactland</p>
          </div>
          <div className="card">
            <h4>📧 Email</h4>
            <p>support@reactrouterdemo.dev</p>
          </div>
          <div className="card">
            <h4>⚡ React Router Features</h4>
            <p>Form submission is handled in pure client state with <code>useState</code> without any page reload.</p>
          </div>
        </div>
      </div>

      <div className="cta-group">
        <Link to="/" className="btn btn-secondary">&larr; Return to Home</Link>
        <Link to="/about" className="btn btn-secondary">Read About Page</Link>
      </div>
    </div>
  );
}

