// src/layouts/PublicLayout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="container mt-5">
      <nav>
        <ul>
          <li><Link to="/admin-login">Admin Login</Link></li> {}
        </ul>
      </nav>
      <Outlet /> {}
    </div>
  );
};

export default PublicLayout;
