import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The route you are trying to visit does not exist.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}

