import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './router-demo.css';

/**
 * Main Application Component showcasing React Router Navigation.
 * 
 * - BrowserRouter: Provides HTML5 History API context to entire tree.
 * - Routes: Selectively renders the best matching <Route> child.
 * - Route: Maps a URL path (e.g. "/", "/about", "/contact") to an element component.
 * - Link: Rendered inside <Navbar> and pages to navigate without full page reloads.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        {/* Persistent Navigation Bar */}
        <Navbar />

        {/* Dynamic Route View (swapped in/out without reloading the page) */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Persistent Footer */}
        <footer className="footer">
          React Router Navigation Demo &bull; Pure Client-Side Single Page Application
        </footer>
      </div>
    </BrowserRouter>
  );
}

